import { Router } from 'express'
import { resumo, fluxoCaixa, relatorios, historico } from '../controllers/financeiroController.js'

const router = Router()

router.get('/resumo', resumo)
router.get('/historico', historico)
router.get('/fluxo-caixa', fluxoCaixa)
router.get('/relatorios', relatorios)

export default router
