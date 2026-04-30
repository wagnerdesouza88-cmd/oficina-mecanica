import prisma from '../lib/prisma.js'

export async function resumo(_req, res) {
  try {
    const produtos = await prisma.produto.findMany({ where: { ativo: true } })
    const totalProdutos = produtos.length
    const criticos = produtos.filter(
      (p) => Number(p.quantidadeAtual) <= Number(p.quantidadeMinima)
    ).length
    const emAlerta = produtos.filter(
      (p) =>
        Number(p.quantidadeAtual) > Number(p.quantidadeMinima) &&
        Number(p.quantidadeAtual) <= Number(p.quantidadeMinima) * 1.5
    ).length
    const valorTotalEstoque = produtos.reduce(
      (acc, p) => acc + Number(p.quantidadeAtual) * Number(p.precoCompra),
      0
    )
    res.json({ totalProdutos, criticos, emAlerta, valorTotalEstoque })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
