import { Router } from "express";
import { filesController } from "../controllers/files";

const router = Router();

router.post("/transfer", filesController.transferFile);

export default router;
