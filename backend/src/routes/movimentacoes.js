import { Router } from 'express'
import { listar } from '../controllers/movimentacaoController.js'

const router = Router()

router.get('/', listar)

export default router
