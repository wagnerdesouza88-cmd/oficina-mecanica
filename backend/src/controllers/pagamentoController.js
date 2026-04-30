import { z } from 'zod'
import prisma from '../lib/prisma.js'

const formaEnum = z.enum(['DINHEIRO', 'DEBITO', 'CREDITO', 'PIX', 'BOLETO'])
const statusEnum = z.enum(['PENDENTE', 'PAGO', 'CANCELADO'])

const pagamentoSchema = z.object({
  ordemServicoId: z.string().min(1, 'OS é obrigatória'),
  valor:          z.coerce.number().min(0, 'Valor inválido'),
  formaPagamento: formaEnum,
  parcelas:       z.coerce.number().int().min(1).max(12).default(1),
  status:         statusEnum.default('PAGO'),
  dataPagamento:  z.string().optional().nullable(),
  observacoes:    z.string().optional().nullable(),
})

const include = {
  ordemServico: {
    include: {
      veiculo: { include: { cliente: { select: { id: true, nome: true } } } },
    },
  },
}

export async function listar(_req, res) {
  try {
    const pagamentos = await prisma.pagamento.findMany({
      include,
      orderBy: { createdAt: 'desc' },
    })
    res.json(pagamentos)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar pagamentos' })
  }
}

export async function criar(req, res) {
  try {
    const input = pagamentoSchema.parse(req.body)
    const valorParcela = input.valor / input.parcelas
    const pagamento = await prisma.pagamento.create({
      data: {
        ...input,
        valorParcela,
        dataPagamento: input.dataPagamento ? new Date(input.dataPagamento) : new Date(),
      },
      include,
    })
    res.status(201).json(pagamento)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2002') return res.status(409).json({ error: 'Já existe um pagamento para esta OS' })
    if (err.code === 'P2003') return res.status(404).json({ error: 'OS não encontrada' })
    res.status(500).json({ error: 'Erro ao registrar pagamento' })
  }
}

export async function atualizar(req, res) {
  try {
    const input = pagamentoSchema.partial().parse(req.body)
    const data = { ...input }
    if (input.valor !== undefined && input.parcelas !== undefined) {
      data.valorParcela = input.valor / input.parcelas
    }
    if (input.dataPagamento) data.dataPagamento = new Date(input.dataPagamento)
    const pagamento = await prisma.pagamento.update({
      where: { id: req.params.id },
      data,
      include,
    })
    res.json(pagamento)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Pagamento não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar pagamento' })
  }
}
