import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db";
import { DBFolder } from "../types";

export class FoldersController {
  createFolder(req: Request, res: Response) {
    try {
      const { title } = req.body;
      const id = uuidv4();

      const maxOrder = db
        .prepare("SELECT MAX(order_num) as max_order FROM folders")
        .get() as { max_order: number };

      const order = (maxOrder?.max_order || 0) + 1;

      db.prepare(
        `
        INSERT INTO folders (id, title, order_num, type, icon, is_open)
        VALUES (?, ?, ?, 'folder', 'folder', true)
      `
      ).run(id, title, order);

      const folder = db
        .prepare("SELECT * FROM folders WHERE id = ?")
        .get(id) as DBFolder;

      res.status(201).json({
        ...folder,
        items: [],
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create folder" });
    }
  }

  toggleFolder(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { isOpen } = req.body;

      db.prepare("UPDATE folders SET is_open = ? WHERE id = ?").run(isOpen, id);

      const folder = db
        .prepare(
          `
          SELECT f.*, json_group_array(
            json_object(
              'id', files.id,
              'title', files.title,
              'order', files.order_num,
              'type', files.type,
              'icon', files.icon
            )
          ) as items
          FROM folders f
          LEFT JOIN files ON f.id = files.folder_id
          WHERE f.id = ?
          GROUP BY f.id
        `
        )
        .get(id);

      res.json(folder);
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle folder" });
    }
  }

  reorderFolders(req: Request, res: Response) {
    try {
      const { folderIds } = req.body;

      const stmt = db.prepare("UPDATE folders SET order_num = ? WHERE id = ?");

      db.transaction(() => {
        folderIds.forEach((id: string, index: number) => {
          stmt.run(index + 1, id);
        });
      })();

      const folders = db
        .prepare(
          `
          SELECT f.*, json_group_array(
            json_object(
              'id', files.id,
              'title', files.title,
              'order', files.order_num,
              'type', files.type,
              'icon', files.icon
            )
          ) as items
          FROM folders f
          LEFT JOIN files ON f.id = files.folder_id
          GROUP BY f.id
          ORDER BY f.order_num
        `
        )
        .all();

      res.json(folders);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder folders" });
    }
  }

  getAllFolders(req: Request, res: Response) {
    try {
      const folders = db
        .prepare(
          `
          SELECT f.*,
            COALESCE(
              json_group_array(
                CASE WHEN files.id IS NULL THEN NULL
                ELSE json_object(
                  'id', files.id,
                  'title', files.title,
                  'order_num', files.order_num,
                  'type', files.type,
                  'icon', files.icon
                )
                END
              ),
              '[]'
            ) as items
          FROM folders f
          LEFT JOIN files ON f.id = files.folder_id
          WHERE f.id != '0'
          GROUP BY f.id
          ORDER BY f.order_num
        `
        )
        .all();

      // Clean up the items array (remove null entries)
      const cleanedFolders = folders.map((folder: any) => ({
        ...folder,
        items: JSON.parse(folder.items).filter(Boolean),
      }));

      res.json(cleanedFolders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch folders" });
    }
  }
}

export const foldersController = new FoldersController();
