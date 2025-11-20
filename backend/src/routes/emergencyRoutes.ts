import { Router } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { emergenciaController } from '../controllers/emergenciaController';

const router = Router();

router.post('/emergencias', asyncHandler(emergenciaController.create));
router.get('/emergencias', asyncHandler(emergenciaController.getAll));
router.get('/emergencias/:id', asyncHandler(emergenciaController.getById));
router.put('/emergencias/:id', asyncHandler(emergenciaController.update));
router.delete('/emergencias/:id', asyncHandler(emergenciaController.delete));
router.put('/linkOrg/:_id', asyncHandler(emergenciaController.join));

export default router;
