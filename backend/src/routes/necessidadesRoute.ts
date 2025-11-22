import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { necessidadesController } from '../controllers/necessidadesController';

const router = Router();

router.post('/', asyncHandler(necessidadesController.create));
router.get('/', asyncHandler(necessidadesController.getAll));
router.post('/ajudar/:_id', asyncHandler(necessidadesController.ajudar));
router.put('/:_id', asyncHandler(necessidadesController.update));
router.delete('/:_id', asyncHandler(necessidadesController.delete));
// router.get('/:id', asyncHandler(perfilController.getById));

export default router;
