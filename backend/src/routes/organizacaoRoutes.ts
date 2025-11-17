import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { organizacaoController } from '../controllers/organizacaoController';

const router = Router();

router.post('/', asyncHandler(organizacaoController.create));
router.get('/', asyncHandler(organizacaoController.getAll));

export default router;
