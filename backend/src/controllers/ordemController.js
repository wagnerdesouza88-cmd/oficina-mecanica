import { z } from 'zod'
import prisma from '../lib/prisma.js'

const statusEnum = z.enum(['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'CANCELADA'])

const itemSchema = z.object({
  tipoServicoId: z.string().nullable().optional(),
  nome:          z.string().min(1, 'Nome do serviço é obrigatório'),
  preco:         z.coerce.number().min(0, 'Preço inválido'),
})

const pecaSchema = z.object({
  produtoId:    z.string().min(1),
  quantidade:   z.coerce.number().positive(),
  precoUnitario: z.coerce.number().min(0),
  subtotal:     z.coerce.number().min(0),
})

const ordemSchema = z.object({
  veiculoId:       z.string().min(1, 'Veículo é obrigatório'),
  descricao:       z.string().optional().nullable(),
  status:          statusEnum.default('ABERTA'),
  total:           z.coerce.number().min(0, 'Valor inválido').default(0),
  dataEntrada:     z.string().optional(),
  previsaoEntrega: z.string().optional(),
  dataEntrega:     z.string().optional(),
  itens:           z.array(itemSchema).default([]),
  pecas:           z.array(pecaSchema).default([]),
})

function normalizeDatas(data) {
  return {
    ...data,
    dataEntrada:     data.dataEntrada     ? new Date(data.dataEntrada)     : new Date(),
    previsaoEntrega: data.previsaoEntrega ? new Date(data.previsaoEntrega) : null,
    dataEntrega:     data.dataEntrega     ? new Date(data.dataEntrega)     : null,
  }
}

const include = {
  veiculo: {
    include: { cliente: { select: { id: true, nome: true, cpf: true, telefone: true, email: true } } },
  },
  itens: {
    orderBy: { nome: 'asc' },
  },
  pagamento: true,
  pecas: {
    include: { produto: { select: { id: true, codigo: true, nome: true, unidade: true } } },
  },
}

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

async function estornarPecasOS(tx, ordemId) {
  const pecasAtuais = await tx.pecaOrdemServico.findMany({ where: { ordemServicoId: ordemId } })
  for (const peca of pecasAtuais) {
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

export async function listar(_req, res) {
  try {
    const ordens = await prisma.ordemServico.findMany({
      include,
      orderBy: { createdAt: 'desc' },
    })
    res.json(ordens)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar ordens' })
  }
}

export async function criar(req, res) {
  try {
    const { itens, pecas, ...rest } = normalizeDatas(ordemSchema.parse(req.body))
    const ordem = await prisma.$transaction(async (tx) => {
      const o = await tx.ordemServico.create({
        data: {
          ...rest,
          itens: {
            create: itens.map(({ tipoServicoId, nome, preco }) => ({
              tipoServicoId: tipoServicoId || null,
              nome,
              preco,
            })),
          },
        },
        include,
      })
      if (pecas.length > 0) {
        await darSaidaPecas(tx, o.id, pecas)
        await tx.pecaOrdemServico.createMany({
          data: pecas.map((p) => ({ ...p, ordemServicoId: o.id })),
        })
      }
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
      await estornarPecasOS(tx, req.params.id)
      const o = await tx.ordemServico.update({
        where: { id: req.params.id },
        data: {
          ...rest,
          itens: {
            deleteMany: {},
            create: itens.map(({ tipoServicoId, nome, preco }) => ({
              tipoServicoId: tipoServicoId || null,
              nome,
              preco,
            })),
          },
        },
        include,
      })
      if (pecas.length > 0) {
        await darSaidaPecas(tx, o.id, pecas)
        await tx.pecaOrdemServico.createMany({
          data: pecas.map((p) => ({ ...p, ordemServicoId: o.id })),
        })
      }
      return tx.ordemServico.findUnique({ where: { id: o.id }, include })
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
      if (atual && !atual.dataEntrega) {
        dadosUpdate.dataEntrega = new Date()
      }
    }

    if (status === 'CANCELADA') {
      const ordem = await prisma.$transaction(async (tx) => {
        await estornarPecasOS(tx, req.params.id)
        return tx.ordemServico.update({
          where: { id: req.params.id },
          data: dadosUpdate,
          include,
        })
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
