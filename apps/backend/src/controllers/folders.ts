import { Request, Response } from "express";
import db from "../db";

export class FoldersController {
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
