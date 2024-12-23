import { Router } from "express";
import { foldersController } from "../controllers/folders";

const router = Router();

router.get("/", foldersController.getAllFolders);
router.post("/", foldersController.createFolder);
router.patch("/:id/toggle", foldersController.toggleFolder);
router.patch("/reorder", foldersController.reorderFolders);

export default router;
