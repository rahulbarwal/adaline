import { Router } from "express";
import { filesController } from "../controllers/files";

const router = Router();

router.patch("/folders/:folderId/files/reorder", filesController.reorderFiles);
router.post("/transfer", filesController.transferFile);

export default router;
