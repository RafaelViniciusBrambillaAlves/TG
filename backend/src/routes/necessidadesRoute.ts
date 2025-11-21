import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { necessidadesController } from '../controllers/necessidadesController';

const router = Router();

router.post('/', asyncHandler(necessidadesController.create));
router.get('/', asyncHandler(necessidadesController.getAll));
router.post('/ajudar/:_id', asyncHandler(necessidadesController.ajudar));
// router.get('/:id', asyncHandler(perfilController.getById));
// router.put('/:id', asyncHandler(perfilController.update));
// router.delete('/:id', asyncHandler(perfilController.delete));

export default router;
