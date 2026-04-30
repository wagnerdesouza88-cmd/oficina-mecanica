import { Router } from 'express'
import { buscar, atualizar } from '../controllers/configuracaoController.js'

const router = Router()

router.get('/', buscar)
router.put('/', atualizar)

export default router
