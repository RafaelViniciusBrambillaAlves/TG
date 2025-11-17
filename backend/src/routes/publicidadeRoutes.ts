import { Router } from "express";
import { publicidadeController } from "../controllers/publicidadeController";
import { asyncHandler } from "../middlewares/asyncHandler";

const router = Router();

router.get("/publicidades", asyncHandler(publicidadeController.getAll));
router.get("/publicidades/:id", asyncHandler(publicidadeController.getById));
router.post("/publicidades", asyncHandler(publicidadeController.create));
router.put("/publicidades/:id", asyncHandler(publicidadeController.update));
router.delete("/publicidades/:id", asyncHandler(publicidadeController.remove));

export default router;
