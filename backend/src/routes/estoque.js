import { Router } from 'express'
import { resumo } from '../controllers/estoqueController.js'

const router = Router()

router.get('/resumo', resumo)

export default router
