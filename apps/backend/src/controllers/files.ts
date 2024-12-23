import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db";
import { DBFile } from "../types";

export class FilesController {
  createFile(req: Request, res: Response) {
    try {
      const { title, icon, folderId = "0" } = req.body;
      const id = uuidv4();

      const maxOrder = db
        .prepare(
          "SELECT MAX(order_num) as max_order FROM files WHERE folder_id = ?"
        )
        .get(folderId) as { max_order: number };

      const order = (maxOrder?.max_order || 0) + 1;

      db.prepare(
        `
        INSERT INTO files (id, folder_id, title, order_num, type, icon)
        VALUES (?, ?, ?, ?, 'file', ?)
      `
      ).run(id, folderId, title, order, icon);

      const file = db
        .prepare("SELECT * FROM files WHERE id = ?")
        .get(id) as DBFile;

      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ error: "Failed to create file" });
    }
  }

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

  reorderFiles(req: Request, res: Response) {
    try {
      const { folderId } = req.params;
      const { fileIds } = req.body;

      const stmt = db.prepare(
        "UPDATE files SET order_num = ? WHERE id = ? AND folder_id = ?"
      );

      db.transaction(() => {
        fileIds.forEach((id: string, index: number) => {
          stmt.run(index + 1, id, folderId);
        });
      })();

      const files = db
        .prepare(
          `
          SELECT * FROM files 
          WHERE folder_id = ? 
          ORDER BY order_num
        `
        )
        .all(folderId);

      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder files" });
    }
  }
}

export const filesController = new FilesController();
