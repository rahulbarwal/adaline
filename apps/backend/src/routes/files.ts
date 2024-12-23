import { Router } from "express";
import { filesController } from "../controllers/files";

const router = Router();

router.get("/root", filesController.getRootFiles);
