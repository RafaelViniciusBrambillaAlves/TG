import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { userController } from '../controllers/userController';

const router = Router();

router.post('/register', asyncHandler(userController.register));
router.post('/login', asyncHandler(userController.login));
router.get('/', asyncHandler(userController.getAllVoluntarios));
router.get('/:id', asyncHandler(userController.getById));
router.post('/linkUserOrganization', asyncHandler(userController.linkUserOrganization));
router.put("/usuarios/:id", userController.update);
router.put("/usuarios/:id/password", userController.changePassword);
// router.put('/:id', asyncHandler(userController.update)); // se existir
// router.delete('/:id', asyncHandler(userController.delete)); // se existir

export default router;
