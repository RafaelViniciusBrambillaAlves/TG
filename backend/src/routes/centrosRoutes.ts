import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { userController } from '../controllers/userController';
import { centrosController } from '../controllers/centrosController';

const router = Router();

router.post('/', asyncHandler(centrosController.create));
router.get('/', asyncHandler(centrosController.getAll));

export default router;
