import { z } from 'zod'
import prisma from '../lib/prisma.js'

const veiculoSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  placa: z.string()
    .transform((v) => v.replace(/[^A-Z0-9]/gi, '').toUpperCase())
    .refine(
      (v) => /^[A-Z]{3}[0-9]{4}$/.test(v) || /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(v),
      'Placa inválida (ex: ABC-1234 ou ABC-1D23)'
    ),
  marca: z.string().min(1, 'Marca é obrigatória'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  ano: z.coerce.number().int().min(1900, 'Ano inválido').max(new Date().getFullYear() + 1, 'Ano inválido'),
  cor: z.string().min(1, 'Cor é obrigatória'),
})

export async function listar(_req, res) {
  try {
    const veiculos = await prisma.veiculo.findMany({
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(veiculos)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar veículos' })
  }
}

export async function criar(req, res) {
  try {
    const data = veiculoSchema.parse(req.body)
    const veiculo = await prisma.veiculo.create({
      data,
      include: { cliente: { select: { id: true, nome: true } } },
    })
    res.status(201).json(veiculo)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2002') return res.status(409).json({ error: 'Placa já cadastrada' })
    if (err.code === 'P2003') return res.status(400).json({ error: 'Cliente não encontrado' })
    res.status(500).json({ error: 'Erro ao criar veículo' })
  }
}

export async function atualizar(req, res) {
  try {
    const data = veiculoSchema.parse(req.body)
    const veiculo = await prisma.veiculo.update({
      where: { id: req.params.id },
      data,
      include: { cliente: { select: { id: true, nome: true } } },
    })
    res.json(veiculo)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2002') return res.status(409).json({ error: 'Placa já cadastrada' })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Veículo não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar veículo' })
  }
}

export async function deletar(req, res) {
  try {
    await prisma.veiculo.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2003') return res.status(409).json({ error: 'Veículo possui ordens de serviço cadastradas' })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Veículo não encontrado' })
    res.status(500).json({ error: 'Erro ao deletar veículo' })
  }
}
