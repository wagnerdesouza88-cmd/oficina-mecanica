import { z } from 'zod'
import prisma from '../lib/prisma.js'

const statusEnum = z.enum(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA'])

// Peças internas de um serviço (custo — não aparece na OS do cliente)
const itemPecaSchema = z.object({
  produtoId:   z.string().min(1),
  quantidade:  z.coerce.number().positive(),
  precoCompra: z.coerce.number().min(0),
  subtotal:    z.coerce.number().min(0),
})

// Serviço realizado (o cliente vê somente nome + valor total)
const itemSchema = z.object({
  tipoServicoId:  z.string().nullable().optional(),
  nome:           z.string().min(1, 'Nome do serviço é obrigatório'),
  preco:          z.coerce.number().min(0, 'Preço inválido'),
  custoPecas:     z.coerce.number().min(0).default(0),
  valorMaoDeObra: z.coerce.number().min(0).default(0),
  pecas:          z.array(itemPecaSchema).default([]),
})

// Produto vendido diretamente ao cliente (com markup)
const pecaVendaSchema = z.object({
  produtoId:     z.string().min(1),
  quantidade:    z.coerce.number().positive(),
  precoUnitario: z.coerce.number().min(0),
  precoCompra:   z.coerce.number().min(0).default(0),
  subtotal:      z.coerce.number().min(0),
})

const ordemSchema = z.object({
  veiculoId:       z.string().min(1, 'Veículo é obrigatório'),
  descricao:       z.string().optional().nullable(),
  status:          statusEnum.default('ABERTA'),
  total:           z.coerce.number().min(0).default(0),
  dataEntrada:     z.string().optional(),
  previsaoEntrega: z.string().optional(),
  dataEntrega:     z.string().optional(),
  itens:           z.array(itemSchema).default([]),
  pecas:           z.array(pecaVendaSchema).default([]),
})

function normalizeDatas(data) {
  return {
    ...data,
    dataEntrada:     data.dataEntrada     ? new Date(data.dataEntrada)     : new Date(),
    previsaoEntrega: data.previsaoEntrega ? new Date(data.previsaoEntrega) : null,
    dataEntrega:     data.dataEntrega     ? new Date(data.dataEntrega)     : null,
  }
}

// Include padrão: itens com suas peças de custo, + produtos de venda direta
const include = {
  veiculo: {
    include: { cliente: { select: { id: true, nome: true, cpf: true, telefone: true, email: true } } },
  },
  itens: {
    orderBy: { nome: 'asc' },
    include: {
      pecas: {
        include: { produto: { select: { id: true, codigo: true, nome: true, unidade: true } } },
      },
    },
  },
  pagamento: true,
  pecas: {
    where: { tipo: 'VENDA_DIRETA' },
    include: { produto: { select: { id: true, codigo: true, nome: true, unidade: true } } },
  },
}

// Dá baixa no estoque para qualquer lista de peças {produtoId, quantidade}
async function darSaidaPecas(tx, ordemId, pecas) {
  for (const peca of pecas) {
    const produto = await tx.produto.findUnique({ where: { id: peca.produtoId } })
    if (!produto) throw new Error(`Produto ${peca.produtoId} não encontrado`)
    if (Number(produto.quantidadeAtual) < peca.quantidade) {
      throw new Error(`Estoque insuficiente para ${produto.nome}`)
    }
    const novaQtd = Number(produto.quantidadeAtual) - peca.quantidade
    await tx.produto.update({ where: { id: peca.produtoId }, data: { quantidadeAtual: novaQtd } })
    await tx.movimentacaoEstoque.create({
      data: {
        produtoId: peca.produtoId,
        tipo: 'SAIDA',
        quantidade: peca.quantidade,
        quantidadeAnterior: Number(produto.quantidadeAtual),
        quantidadeAtual: novaQtd,
        motivo: `Saída para OS ${ordemId}`,
        ordemServicoId: ordemId,
      },
    })
  }
}

// Estorna todas as peças de uma OS (ambos os tipos) e as remove
async function estornarPecasOS(tx, ordemId) {
  const pecas = await tx.pecaOrdemServico.findMany({ where: { ordemServicoId: ordemId } })
  for (const peca of pecas) {
    const produto = await tx.produto.findUnique({ where: { id: peca.produtoId } })
    if (!produto) continue
    const novaQtd = Number(produto.quantidadeAtual) + Number(peca.quantidade)
    await tx.produto.update({ where: { id: peca.produtoId }, data: { quantidadeAtual: novaQtd } })
    await tx.movimentacaoEstoque.create({
      data: {
        produtoId: peca.produtoId,
        tipo: 'AJUSTE',
        quantidade: Number(peca.quantidade),
        quantidadeAnterior: Number(produto.quantidadeAtual),
        quantidadeAtual: novaQtd,
        motivo: `Estorno de OS ${ordemId}`,
        ordemServicoId: ordemId,
      },
    })
  }
  await tx.pecaOrdemServico.deleteMany({ where: { ordemServicoId: ordemId } })
}

// Cria os itens + suas peças de custo para uma OS
async function criarItensComPecas(tx, ordemId, itens) {
  for (const item of itens) {
    const { pecas: itemPecas, ...itemData } = item
    const createdItem = await tx.itemOrdemServico.create({
      data: {
        ordemId,
        tipoServicoId:  itemData.tipoServicoId || null,
        nome:           itemData.nome,
        preco:          itemData.preco,
        custoPecas:     itemData.custoPecas,
        valorMaoDeObra: itemData.valorMaoDeObra,
      },
    })
    if (itemPecas.length > 0) {
      await darSaidaPecas(tx, ordemId, itemPecas)
      await tx.pecaOrdemServico.createMany({
        data: itemPecas.map((p) => ({
          ordemServicoId:     ordemId,
          produtoId:          p.produtoId,
          quantidade:         p.quantidade,
          precoUnitario:      p.precoCompra,
          precoCompra:        p.precoCompra,
          subtotal:           p.subtotal,
          tipo:               'CUSTO_SERVICO',
          itemOrdemServicoId: createdItem.id,
        })),
      })
    }
  }
}

// Cria os produtos de venda direta (VENDA_DIRETA) de uma OS
async function criarPecasVenda(tx, ordemId, pecas) {
  if (pecas.length === 0) return
  await darSaidaPecas(tx, ordemId, pecas)
  await tx.pecaOrdemServico.createMany({
    data: pecas.map((p) => ({
      ordemServicoId:     ordemId,
      produtoId:          p.produtoId,
      quantidade:         p.quantidade,
      precoUnitario:      p.precoUnitario,
      precoCompra:        p.precoCompra,
      subtotal:           p.subtotal,
      tipo:               'VENDA_DIRETA',
      itemOrdemServicoId: null,
    })),
  })
}

export async function listar(_req, res) {
  try {
    const ordens = await prisma.ordemServico.findMany({ include, orderBy: { createdAt: 'desc' } })
    res.json(ordens)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ordens' })
  }
}

export async function criar(req, res) {
  try {
    const { itens, pecas, ...rest } = normalizeDatas(ordemSchema.parse(req.body))
    const ordem = await prisma.$transaction(async (tx) => {
      const o = await tx.ordemServico.create({ data: { ...rest } })
      await criarItensComPecas(tx, o.id, itens)
      await criarPecasVenda(tx, o.id, pecas)
      return tx.ordemServico.findUnique({ where: { id: o.id }, include })
    })
    res.status(201).json(ordem)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2003') return res.status(400).json({ error: 'Veículo não encontrado' })
    if (err.message?.includes('Estoque insuficiente')) return res.status(400).json({ error: err.message })
    res.status(500).json({ error: 'Erro ao criar ordem' })
  }
}

export async function atualizar(req, res) {
  try {
    const { itens, pecas, ...rest } = normalizeDatas(ordemSchema.parse(req.body))
    const ordem = await prisma.$transaction(async (tx) => {
      // Estorna tudo (CUSTO_SERVICO + VENDA_DIRETA) e limpa registros
      await estornarPecasOS(tx, req.params.id)
      // Remove itens antigos (cascade não é necessário pois pecas já foram deletadas)
      await tx.itemOrdemServico.deleteMany({ where: { ordemId: req.params.id } })
      // Atualiza dados base da OS
      await tx.ordemServico.update({ where: { id: req.params.id }, data: { ...rest } })
      // Recria itens com suas peças de custo
      await criarItensComPecas(tx, req.params.id, itens)
      // Recria produtos de venda direta
      await criarPecasVenda(tx, req.params.id, pecas)
      return tx.ordemServico.findUnique({ where: { id: req.params.id }, include })
    })
    res.json(ordem)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Ordem não encontrada' })
    if (err.message?.includes('Estoque insuficiente')) return res.status(400).json({ error: err.message })
    res.status(500).json({ error: 'Erro ao atualizar ordem' })
  }
}

export async function atualizarStatus(req, res) {
  try {
    const { status } = z.object({ status: statusEnum }).parse(req.body)
    const dadosUpdate = { status }

    if (status === 'CONCLUIDA') {
      const atual = await prisma.ordemServico.findUnique({
        where: { id: req.params.id },
        select: { dataEntrega: true },
      })
      if (atual && !atual.dataEntrega) dadosUpdate.dataEntrega = new Date()
    }

    if (status === 'CANCELADA') {
      const ordem = await prisma.$transaction(async (tx) => {
        await estornarPecasOS(tx, req.params.id)
        return tx.ordemServico.update({ where: { id: req.params.id }, data: dadosUpdate, include })
      })
      return res.json(ordem)
    }

    const ordem = await prisma.ordemServico.update({
      where: { id: req.params.id },
      data: dadosUpdate,
      include,
    })
    res.json(ordem)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Ordem não encontrada' })
    res.status(500).json({ error: 'Erro ao atualizar status' })
  }
}

export async function deletar(req, res) {
  try {
    await prisma.$transaction(async (tx) => {
      await estornarPecasOS(tx, req.params.id)
      await tx.ordemServico.delete({ where: { id: req.params.id } })
    })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Ordem não encontrada' })
    res.status(500).json({ error: 'Erro ao deletar ordem' })
  }
}
