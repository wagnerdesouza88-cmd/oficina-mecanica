import { Router } from 'express'
import {
  listar,
  alertas,
  buscarPorId,
  criar,
  atualizar,
  deletar,
  registrarEntrada,
  registrarAjuste,
} from '../controllers/produtoController.js'

const router = Router()

router.get('/alertas', alertas)
router.get('/', listar)
router.get('/:id', buscarPorId)
router.post('/', criar)
router.put('/:id', atualizar)
router.delete('/:id', deletar)
router.post('/:id/entrada', registrarEntrada)
router.post('/:id/ajuste', registrarAjuste)

export default router
