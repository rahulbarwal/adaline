import { Router } from "express";
import { foldersController } from "../controllers/folders";

const router = Router();

router.get("/", foldersController.getAllFolders);
export default router;
