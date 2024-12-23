import { Router } from "express";
import { filesController } from "../controllers/files";

const router = Router();

router.get("/root", filesController.getRootFiles);
router.post("/", filesController.createFile);
router.patch("/folders/:folderId/files/reorder", filesController.reorderFiles);

export default router;
