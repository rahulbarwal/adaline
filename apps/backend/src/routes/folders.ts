import { Router } from "express";
import { foldersController } from "../controllers/folders";

const router = Router();

router.post("/", foldersController.createFolder);
router.patch("/reorder", foldersController.reorderFolders);

export default router;
