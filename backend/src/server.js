import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import clientesRouter from './routes/clientes.js'
import veiculosRouter from './routes/veiculos.js'
import ordensRouter from './routes/ordens.js'
import tiposServicoRouter from './routes/tiposServico.js'
import pagamentosRouter from './routes/pagamentos.js'
import contasPagarRouter from './routes/contasPagar.js'
import financeiroRouter from './routes/financeiro.js'
import produtosRouter from './routes/produtos.js'
import movimentacoesRouter from './routes/movimentacoes.js'
import estoqueRouter from './routes/estoque.js'
import configuracaoRouter from './routes/configuracao.js'

const app = express()
const PORT = process.env.PORT || 3333

const allowedOrigin = process.env.FRONTEND_URL || /^http:\/\/localhost:\d+$/
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/clientes', clientesRouter)
app.use('/veiculos', veiculosRouter)
app.use('/ordens', ordensRouter)
app.use('/tipos-servico', tiposServicoRouter)
app.use('/pagamentos', pagamentosRouter)
app.use('/contas-pagar', contasPagarRouter)
app.use('/financeiro', financeiroRouter)
app.use('/produtos', produtosRouter)
app.use('/movimentacoes', movimentacoesRouter)
app.use('/estoque', estoqueRouter)
app.use('/configuracao', configuracaoRouter)

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
