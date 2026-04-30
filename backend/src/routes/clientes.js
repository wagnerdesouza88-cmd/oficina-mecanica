import { Router } from 'express'
import { listar, criar, atualizar, deletar } from '../controllers/clienteController.js'

const router = Router()

router.get('/', listar)
router.post('/', criar)
router.put('/:id', atualizar)
router.delete('/:id', deletar)

export default router
