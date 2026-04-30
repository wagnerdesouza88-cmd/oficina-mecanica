import { z } from 'zod'
import prisma from '../lib/prisma.js'

const schema = z.object({
  nomeOficina: z.string().optional(),
  slogan: z.string().optional(),
  nomeEmpresarial: z.string().optional(),
  nomeFantasia: z.string().optional(),
  cnpj: z.string().optional(),
  inscricaoEstadual: z.string().optional(),
  rua: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  corPrimaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  corSecundaria: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  logoBase64: z.string().nullable().optional(),
})

async function getOrCreate() {
  let config = await prisma.configuracaoSistema.findFirst()
  if (!config) config = await prisma.configuracaoSistema.create({ data: {} })
  return config
}

export async function buscar(_req, res) {
  try { res.json(await getOrCreate()) }
  catch (e) { res.status(500).json({ error: e.message }) }
}

export async function atualizar(req, res) {
  try {
    const data = schema.parse(req.body)
    const atual = await getOrCreate()
    const config = await prisma.configuracaoSistema.update({ where: { id: atual.id }, data })
    res.json(config)
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: e.errors })
    res.status(500).json({ error: e.message })
  }
}
