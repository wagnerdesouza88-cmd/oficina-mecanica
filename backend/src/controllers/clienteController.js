import { z } from 'zod'
import prisma from '../lib/prisma.js'

const clienteSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  telefone: z.string().refine(
    (v) => v.replace(/\D/g, '').length >= 10,
    'Telefone inválido — mínimo 10 dígitos'
  ),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  cpf: z
    .string()
    .refine((v) => !v || v.replace(/\D/g, '').length === 11, 'CPF deve ter 11 dígitos')
    .optional()
    .or(z.literal('')),
})

function normalizar(data) {
  return {
    ...data,
    email: data.email || null,
    cpf: data.cpf || null,
  }
}

export async function listar(req, res) {
  try {
    const clientes = await prisma.cliente.findMany({ orderBy: { nome: 'asc' } })
    res.json(clientes)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar clientes' })
  }
}

export async function criar(req, res) {
  try {
    const data = normalizar(clienteSchema.parse(req.body))
    const cliente = await prisma.cliente.create({ data })
    res.status(201).json(cliente)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2002') return res.status(409).json({ error: 'CPF já cadastrado' })
    res.status(500).json({ error: 'Erro ao criar cliente' })
  }
}

export async function atualizar(req, res) {
  try {
    const data = normalizar(clienteSchema.parse(req.body))
    const cliente = await prisma.cliente.update({ where: { id: req.params.id }, data })
    res.json(cliente)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2002') return res.status(409).json({ error: 'CPF já cadastrado' })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar cliente' })
  }
}

export async function deletar(req, res) {
  try {
    await prisma.cliente.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2003') return res.status(409).json({ error: 'Cliente possui veículos cadastrados' })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Cliente não encontrado' })
    res.status(500).json({ error: 'Erro ao deletar cliente' })
  }
}
