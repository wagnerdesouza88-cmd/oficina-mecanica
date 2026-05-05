import { Router } from 'express'
import { resumo, fluxoCaixa, relatorios, historico, lucratividade } from '../controllers/financeiroController.js'

const router = Router()

router.get('/resumo', resumo)
router.get('/historico', historico)
router.get('/fluxo-caixa', fluxoCaixa)
router.get('/relatorios', relatorios)
router.get('/lucratividade', lucratividade)

export default router
