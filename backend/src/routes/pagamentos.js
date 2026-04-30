import { Router } from 'express'
import { listar, criar, atualizar } from '../controllers/pagamentoController.js'

const router = Router()

router.get('/', listar)
router.post('/', criar)
router.put('/:id', atualizar)

export default router
