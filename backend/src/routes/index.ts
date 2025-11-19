import { Router } from 'express';
import userRoutes from './userRoutes';
import emergenciaRoutes from './emergencyRoutes';
import perfilRoutes from './perfilRoutes';
import publicacaoRoutes from './publicidadeRoutes'
import centrosRoutes from './centrosRoutes';
import necessidadesRoutes from './necessidadesRoute';
import organizacaoRoutes from './organizacaoRoutes';
import upload from './upload'

const router = Router();

router.get('/ping', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// mount por recurso (sem conflitos)
router.use('/usuarios', userRoutes);
router.use('/emergencias', emergenciaRoutes);
router.use('/perfil', perfilRoutes);
router.use('/publicacao', publicacaoRoutes)
router.use('/centros', centrosRoutes)
router.use('/necessidades', necessidadesRoutes)
router.use('/organizacao', organizacaoRoutes)
router.use('/', upload)

// auth / register / login podem ficar em userRoutes, ou num authRoutes separado
export default router;
