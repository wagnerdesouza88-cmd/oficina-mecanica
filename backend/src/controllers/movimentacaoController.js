import prisma from '../lib/prisma.js'

export async function listar(req, res) {
  try {
    const { tipo, produtoId, dataInicio, dataFim } = req.query
    const where = {}
    if (tipo) where.tipo = tipo
    if (produtoId) where.produtoId = produtoId
    if (dataInicio || dataFim) {
      where.createdAt = {}
      if (dataInicio) where.createdAt.gte = new Date(dataInicio)
      if (dataFim) {
        const fim = new Date(dataFim)
        fim.setHours(23, 59, 59, 999)
        where.createdAt.lte = fim
      }
    }
    const movimentacoes = await prisma.movimentacaoEstoque.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        produto: { select: { id: true, codigo: true, nome: true, unidade: true } },
        ordemServico: { select: { id: true } },
      },
    })
    res.json(movimentacoes)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
