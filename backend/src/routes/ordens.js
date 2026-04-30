import { Router } from 'express'
import { listar, criar, atualizar, atualizarStatus, deletar } from '../controllers/ordemController.js'

const router = Router()

router.get('/', listar)
router.post('/', criar)
router.put('/:id', atualizar)
router.patch('/:id/status', atualizarStatus)
router.delete('/:id', deletar)

export default router
