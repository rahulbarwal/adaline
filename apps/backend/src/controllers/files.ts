import { Request, Response } from "express";
import db from "../db";

export class FilesController {
  getRootFiles(req: Request, res: Response) {
    try {
      const files = db
        .prepare(
          `
          SELECT * FROM files 
          WHERE folder_id = '0'
          ORDER BY order_num
        `
        )
        .all();

      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch root files" });
    }
  }
}

export const filesController = new FilesController();
