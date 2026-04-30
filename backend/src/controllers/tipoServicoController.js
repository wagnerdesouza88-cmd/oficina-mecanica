import { z } from 'zod'
import prisma from '../lib/prisma.js'

const CATEGORIAS = ['PREVENTIVA', 'FREIOS', 'SUSPENSAO_DIRECAO', 'MOTOR', 'ELETRICA', 'CAMBIO_TRANSMISSAO', 'FUNILARIA_PINTURA']

const tipoSchema = z.object({
  nome:          z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  categoria:     z.string().min(1, 'Categoria é obrigatória'),
  precoSugerido: z.coerce.number().min(0, 'Preço inválido'),
  ativo:         z.boolean().default(true),
})

export async function listar(req, res) {
  try {
    const where = req.query.todos === 'true' ? {} : { ativo: true }
    const tipos = await prisma.tipoServico.findMany({
      where,
      orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
    })
    res.json(tipos)
  } catch {
    res.status(500).json({ error: 'Erro ao buscar tipos de serviço' })
  }
}

export async function criar(req, res) {
  try {
    const data = tipoSchema.parse(req.body)
    const tipo = await prisma.tipoServico.create({ data })
    res.status(201).json(tipo)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    res.status(500).json({ error: 'Erro ao criar serviço' })
  }
}

export async function atualizar(req, res) {
  try {
    const data = tipoSchema.partial().parse(req.body)
    const tipo = await prisma.tipoServico.update({
      where: { id: req.params.id },
      data,
    })
    res.json(tipo)
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors[0].message })
    if (err.code === 'P2025') return res.status(404).json({ error: 'Serviço não encontrado' })
    res.status(500).json({ error: 'Erro ao atualizar serviço' })
  }
}

export async function deletar(req, res) {
  try {
    await prisma.tipoServico.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Serviço não encontrado' })
    if (err.code === 'P2003') return res.status(409).json({ error: 'Serviço vinculado a ordens. Desative-o em vez de excluir.' })
    res.status(500).json({ error: 'Erro ao excluir serviço' })
  }
}

export { CATEGORIAS }
