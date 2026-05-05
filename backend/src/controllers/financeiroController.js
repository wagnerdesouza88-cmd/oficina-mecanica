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

export async function lucratividade(req, res) {
  try {
    const dataInicio = req.query.dataInicio
      ? new Date(req.query.dataInicio)
      : new Date(new Date().getFullYear(), 0, 1)
    const dataFim = req.query.dataFim
      ? new Date(req.query.dataFim + 'T23:59:59')
      : new Date()

    const filtroOS = {
      dataEntrada: { gte: dataInicio, lte: dataFim },
      status: { not: 'CANCELADA' },
    }

    const [itens, pecasVenda] = await Promise.all([
      prisma.itemOrdemServico.findMany({
        where: { ordem: filtroOS },
        select: { nome: true, preco: true, custoPecas: true, valorMaoDeObra: true },
      }),
      prisma.pecaOrdemServico.findMany({
        where: { tipo: 'VENDA_DIRETA', ordem: filtroOS },
        select: {
          quantidade: true,
          precoUnitario: true,
          precoCompra: true,
          subtotal: true,
          produto: { select: { nome: true, codigo: true } },
        },
      }),
    ])

    // Agrupa serviços por nome
    const servicoMap = {}
    for (const item of itens) {
      if (!servicoMap[item.nome]) {
        servicoMap[item.nome] = { nome: item.nome, quantidade: 0, receita: 0, custoPecas: 0 }
      }
      servicoMap[item.nome].quantidade++
      servicoMap[item.nome].receita    += Number(item.preco)
      servicoMap[item.nome].custoPecas += Number(item.custoPecas)
    }
    const porServico = Object.values(servicoMap).map((s) => ({
      ...s,
      lucro:  s.receita - s.custoPecas,
      margem: s.receita > 0 ? ((s.receita - s.custoPecas) / s.receita) * 100 : 0,
    })).sort((a, b) => b.receita - a.receita)

    // Agrupa produtos vendidos por nome
    const produtoMap = {}
    for (const p of pecasVenda) {
      const nome = p.produto?.nome ?? 'Produto'
      if (!produtoMap[nome]) {
        produtoMap[nome] = { nome, quantidade: 0, receita: 0, custo: 0 }
      }
      produtoMap[nome].quantidade += Number(p.quantidade)
      produtoMap[nome].receita    += Number(p.subtotal)
      produtoMap[nome].custo      += Number(p.precoCompra) * Number(p.quantidade)
    }
    const porProduto = Object.values(produtoMap).map((p) => ({
      ...p,
      lucro:  p.receita - p.custo,
      margem: p.receita > 0 ? ((p.receita - p.custo) / p.receita) * 100 : 0,
    })).sort((a, b) => b.receita - a.receita)

    const receitaServicos  = itens.reduce((a, i) => a + Number(i.preco), 0)
    const custoServicos    = itens.reduce((a, i) => a + Number(i.custoPecas), 0)
    const receitaProdutos  = pecasVenda.reduce((a, p) => a + Number(p.subtotal), 0)
    const custoProdutos    = pecasVenda.reduce((a, p) => a + Number(p.precoCompra) * Number(p.quantidade), 0)

    res.json({
      periodo: { inicio: dataInicio, fim: dataFim },
      resumo: {
        receitaServicos,
        custoServicos,
        lucroServicos:  receitaServicos - custoServicos,
        receitaProdutos,
        custoProdutos,
        lucroProdutos:  receitaProdutos - custoProdutos,
        receitaTotal:   receitaServicos + receitaProdutos,
        custoTotal:     custoServicos + custoProdutos,
        lucroTotal:     (receitaServicos - custoServicos) + (receitaProdutos - custoProdutos),
      },
      porServico,
      porProduto,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao calcular lucratividade' })
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
