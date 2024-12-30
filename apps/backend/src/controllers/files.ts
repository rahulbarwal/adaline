import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db";
import { DBFile } from "../types";
import { foldersController } from "./folders";
import { Server } from "socket.io";
import { FileType } from "@adaline/shared-types";

export class FilesController {
  createFile(title: string, icon: string, folderId: string = "0") {
    console.log("Creating file:", title, icon, folderId);
    try {
      const id = uuidv4();

      const maxOrder = db
        .prepare(
          "SELECT MAX(order_num) as max_order FROM files WHERE folder_id = ?",
        )
        .get(folderId) as { max_order: number };

      const order = (maxOrder?.max_order || 0) + 1;

      db.prepare(
        `
        INSERT INTO files (id, folder_id, title, order_num, type, icon)
        VALUES (?, ?, ?, ?, 'file', ?)
      `,
      ).run(id, folderId, title, order, icon);
    } catch (error) {
      throw new Error(`Failed to create file ${error}`);
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
        `,
        )
        .all();

      res.json(files);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch root files" });
    }
  }

  reorderFiles(req: Request & { io?: Server }, res: Response) {
    try {
      const { folderId } = req.params;
      const { fileIds } = req.body;

      const stmt = db.prepare(
        "UPDATE files SET order_num = ? WHERE id = ? AND folder_id = ?",
      );

      db.transaction(() => {
        fileIds.forEach((id: string, index: number) => {
          stmt.run(index + 1, id, folderId);
        });
      })();

      // Get updated items list and emit
      const allItems = foldersController.getAllItemsList();
      req.io?.emit("items:updated", allItems);

      return foldersController.getAllItems(req, res);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder files" });
    }
  }

  transferFile(req: Request & { io?: Server }, res: Response) {
    try {
      const { fileId, targetFolderId, newOrder } = req.body;

      db.transaction(() => {
        // Get current file info
        const currentFile: FileType = db
          .prepare(
            `SELECT folder_id as folderId, order_num as "order" FROM files WHERE id = ?`,
          )
          .get(fileId) as FileType;

        // Moving to different folder
        if (currentFile.folderId !== targetFolderId) {
          // First, shift up items in the old folder
          db.prepare(
            `UPDATE files
             SET order_num = order_num - 1
             WHERE folder_id = ?
             AND order_num > ?`,
          ).run(currentFile.folderId, currentFile.order);

          // Then, shift down items in the new folder
          db.prepare(
            `UPDATE files
             SET order_num = order_num + 1
             WHERE folder_id = ?
             AND order_num >= ?`,
          ).run(targetFolderId, newOrder);
        } else {
          // Moving within same folder
          if (currentFile.order < newOrder) {
            // Moving down - shift items up
            db.prepare(
              `UPDATE files
               SET order_num = order_num - 1
               WHERE folder_id = ?
               AND order_num > ?
               AND order_num <= ?
               AND id != ?`,
            ).run(targetFolderId, currentFile.order, newOrder - 1, fileId);
          } else {
            // Moving up - shift items down
            db.prepare(
              `UPDATE files
               SET order_num = order_num + 1
               WHERE folder_id = ?
               AND order_num >= ?
               AND order_num < ?
               AND id != ?`,
            ).run(targetFolderId, newOrder, currentFile.order, fileId);
          }
        }

        // Finally, update the dragged file's position
        db.prepare(
          `UPDATE files
           SET folder_id = ?, order_num = ?
           WHERE id = ?`,
        ).run(targetFolderId, newOrder, fileId);
      })();

      // Get updated items list and emit
      const allItems = foldersController.getAllItemsList();
      req.io?.emit("items:updated", allItems);

      return foldersController.getAllItems(req, res);
    } catch (error) {
      console.error("Failed to transfer file:", error);
      res.status(500).json({ error: "Failed to transfer file" });
    }
  }
}

export const filesController = new FilesController();
