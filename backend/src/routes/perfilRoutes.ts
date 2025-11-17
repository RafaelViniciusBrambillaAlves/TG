import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { perfilController } from '../controllers/perfilController';

const router = Router();

router.post('/', asyncHandler(perfilController.create));
router.get('/', asyncHandler(perfilController.getAll));
// router.get('/:id', asyncHandler(perfilController.getById));
// router.put('/:id', asyncHandler(perfilController.update));
// router.delete('/:id', asyncHandler(perfilController.delete));

export default router;
