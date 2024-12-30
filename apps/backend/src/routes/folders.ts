import { Router } from "express";
import { foldersController } from "../controllers/folders";

const router = Router();

router.post("/", foldersController.createFolder);

export default router;
