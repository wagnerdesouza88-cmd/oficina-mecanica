import { z } from 'zod'
import prisma from '../lib/prisma.js'

const categoriaEnum = z.enum(['FORNECEDOR', 'ALUGUEL', 'ENERGIA', 'AGUA', 'INTERNET', 'SALARIO', 'IMPOSTO', 'OUTRO'])
const statusEnum = z.enum(['PENDENTE', 'PAGO', 'VENCIDO'])

const contaSchema = z.object({
  descricao:     z.string().min(2, 'Descrição deve ter pelo menos 2 caracteres'),
  categoria:     categoriaEnum,
  valor:         z.coerce.number().min(0, 'Valor inválido'),
  vencimento:    z.string().min(1, 'Vencimento é obrigatório'),
  status:        statusEnum.default('PENDENTE'),
  dataPagamento: z.string().optional().nullable(),
  observacoes:   z.string().optional().nullable(),
})

async function autoMarcarVencidas() {
  await prisma.contaPagar.updateMany({
    where: { status: 'PENDENTE', vencimento: { lt: new Date() } },
    data: { status: 'VENCIDO' },
  })
}

export async function listar(_req, res) {
  try {
    await autoMarcarVencidas()
    const contas = await prisma.contaPagar.findMany({
      orderBy: { vencimento: 'asc' },
    })
    res.json(contas)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' })
  }
}

export async function criar(req, res) {
  try {
    const input = contaSchema.parse(req.body)
    const conta = await prisma.contaPagar.create({
      data: {
        ...input,
        vencimento:    new Date(input.vencimento),
        dataPagamento: input.dataPagamento ? new Date(input.dataPagamento) : null,
      },
    })
    res.status(201).json(conta)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    res.status(500).json({ error: 'Erro ao criar conta' })
  }
}

export async function atualizar(req, res) {
  try {
    const input = contaSchema.partial().parse(req.body)
    const data = { ...input }
    if (input.vencimento) data.vencimento = new Date(input.vencimento)
    if (input.dataPagamento) data.dataPagamento = new Date(input.dataPagamento)
    else if (input.dataPagamento === null) data.dataPagamento = null
    const conta = await prisma.contaPagar.update({
      where: { id: req.params.id },
      data,
    })
    res.json(conta)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Conta não encontrada' })
    res.status(500).json({ error: 'Erro ao atualizar conta' })
  }
}

export async function deletar(req, res) {
  try {
    await prisma.contaPagar.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Conta não encontrada' })
    res.status(500).json({ error: 'Erro ao excluir conta' })
  }
}
