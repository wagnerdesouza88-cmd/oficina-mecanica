import prisma from '../lib/prisma.js'

function inicioMesAtual() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

function fimMesAtual() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
}

export async function resumo(_req, res) {
  try {
    const inicio = inicioMesAtual()
    const fim = fimMesAtual()

    const [
      recebidoMesAgg,
      pagoMesAgg,
      totalApagarAgg,
      ordensAReceber,
    ] = await Promise.all([
      prisma.pagamento.aggregate({
        where: { status: 'PAGO', dataPagamento: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),
      prisma.contaPagar.aggregate({
        where: { status: 'PAGO', dataPagamento: { gte: inicio, lte: fim } },
        _sum: { valor: true },
      }),
      prisma.contaPagar.aggregate({
        where: { status: { in: ['PENDENTE', 'VENCIDO'] } },
        _sum: { valor: true },
      }),
      prisma.ordemServico.findMany({
        where: { status: 'CONCLUIDA' },
        select: { total: true, pagamento: { select: { status: true, valor: true } } },
      }),
    ])

    const recebidoMes = Number(recebidoMesAgg._sum.valor ?? 0)
    const pagoMes = Number(pagoMesAgg._sum.valor ?? 0)
    const totalAPagar = Number(totalApagarAgg._sum.valor ?? 0)
    const saldoMes = recebidoMes - pagoMes

    const emAbertoReceber = ordensAReceber
      .filter((o) => !o.pagamento || o.pagamento.status === 'PENDENTE')
      .reduce((acc, o) => acc + Number(o.total), 0)

    res.json({
      recebidoMes,
      pagoMes,
      saldoMes,
      totalAPagar,
      emAbertoReceber,
      emAbertoPagar: totalAPagar,
    })
  } catch {
    res.status(500).json({ error: 'Erro ao buscar resumo financeiro' })
  }
}

export async function fluxoCaixa(req, res) {
  try {
    const mes = parseInt(req.query.mes) || new Date().getMonth() + 1
    const ano = parseInt(req.query.ano) || new Date().getFullYear()
    const inicio = new Date(ano, mes - 1, 1)
    const fim = new Date(ano, mes, 0, 23, 59, 59, 999)

    const [entradas, saidas] = await Promise.all([
      prisma.pagamento.findMany({
        where: { status: 'PAGO', dataPagamento: { gte: inicio, lte: fim } },
        select: { dataPagamento: true, valor: true, formaPagamento: true },
        orderBy: { dataPagamento: 'asc' },
      }),
      prisma.contaPagar.findMany({
        where: { status: 'PAGO', dataPagamento: { gte: inicio, lte: fim } },
        select: { dataPagamento: true, valor: true, categoria: true, descricao: true },
        orderBy: { dataPagamento: 'asc' },
      }),
    ])

    res.json({ entradas, saidas, mes, ano })
  } catch {
    res.status(500).json({ error: 'Erro ao buscar fluxo de caixa' })
  }
}

export async function historico(_req, res) {
  try {
    const now = new Date()
    const meses = []
    for (let i = 5; i >= 0; i--) {
      const inicio = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999)
      const [rec, desp] = await Promise.all([
        prisma.pagamento.aggregate({
          where: { status: 'PAGO', dataPagamento: { gte: inicio, lte: fim } },
          _sum: { valor: true },
        }),
        prisma.contaPagar.aggregate({
          where: { status: 'PAGO', dataPagamento: { gte: inicio, lte: fim } },
          _sum: { valor: true },
        }),
      ])
      meses.push({
        mes: inicio.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        receita: Number(rec._sum.valor ?? 0),
        despesa: Number(desp._sum.valor ?? 0),
      })
    }
    res.json(meses)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export async function relatorios(req, res) {
  try {
    const dataInicio = req.query.dataInicio
      ? new Date(req.query.dataInicio)
      : new Date(new Date().getFullYear(), 0, 1)
    const dataFim = req.query.dataFim
      ? new Date(req.query.dataFim + 'T23:59:59')
      : new Date()

    const [faturamentoAgg, porForma, topServicos, ordensComMarca] = await Promise.all([
      prisma.pagamento.aggregate({
        where: { status: 'PAGO', dataPagamento: { gte: dataInicio, lte: dataFim } },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.pagamento.groupBy({
        by: ['formaPagamento'],
        where: { status: 'PAGO', dataPagamento: { gte: dataInicio, lte: dataFim } },
        _sum: { valor: true },
        _count: true,
        orderBy: { _sum: { valor: 'desc' } },
      }),
      prisma.itemOrdemServico.groupBy({
        by: ['nome'],
        where: { ordem: { dataEntrada: { gte: dataInicio, lte: dataFim } } },
        _count: { nome: true },
        _sum: { preco: true },
        orderBy: { _count: { nome: 'desc' } },
        take: 10,
      }),
      prisma.ordemServico.findMany({
        where: { dataEntrada: { gte: dataInicio, lte: dataFim } },
        select: { total: true, veiculo: { select: { marca: true } } },
      }),
    ])

    // Agrupa marcas client-side
    const marcaMap = {}
    for (const o of ordensComMarca) {
      const m = o.veiculo.marca
      if (!marcaMap[m]) marcaMap[m] = { marca: m, count: 0, totalFaturado: 0 }
      marcaMap[m].count++
      marcaMap[m].totalFaturado += Number(o.total)
    }
    const topMarcas = Object.values(marcaMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((m) => ({ ...m, ticketMedio: m.count > 0 ? m.totalFaturado / m.count : 0 }))

    res.json({
      periodo: {
        inicio: dataInicio,
        fim: dataFim,
        totalRecebido: Number(faturamentoAgg._sum.valor ?? 0),
        quantidadePagamentos: faturamentoAgg._count,
      },
      porForma,
      topServicos,
      topMarcas,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao gerar relatórios' })
  }
}
