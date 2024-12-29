import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db";
import { ItemType } from "@adaline/shared-types";
import { Server } from "socket.io";

export class FoldersController {
  constructor() {
    this.createFolder = this.createFolder.bind(this);
    this.toggleFolder = this.toggleFolder.bind(this);
    this.reorderFolders = this.reorderFolders.bind(this);
    this.getAllItems = this.getAllItems.bind(this);
    this.getAllItemsList = this.getAllItemsList.bind(this);
  }

  createFolder(req: Request & { io?: Server }, res: Response) {
    try {
      const { title, items } = req.body;
      const id = uuidv4();

      db.transaction(() => {
        const maxOrder = db
          .prepare("SELECT MAX(order_num) as max_order FROM folders")
          .get() as { max_order: number };

        const order = (maxOrder?.max_order || 0) + 1;

        db.prepare(
          `
          INSERT INTO folders (id, title, order_num, type, icon, is_open)
          VALUES (?, ?, ?, 'folder', 'folder', true)
          `,
        ).run(id, title, order);

        if (items && items.length > 0) {
          const updateParentStmt = db.prepare(
            "UPDATE files SET folder_id = ?, order_num = ? WHERE id = ?",
          );

          items.forEach((item: ItemType, index: number) => {
            if (item.type === "file") {
              updateParentStmt.run(id, index + 1, item.id);
            }
          });
        }

        const allItems = this.getAllItemsList();
        req.io?.emit("items:updated", allItems);

        return this.getAllItems(req, res);
      })();
    } catch (error) {
      console.error("Error creating folder:", error);
      res.status(500).json({ error: "Failed to create folder" });
    }
  }

  toggleFolder(folderId: string, isOpen: boolean) {
    try {
      db.prepare("UPDATE folders SET is_open = ? WHERE id = ?").run(
        isOpen ? 1 : 0,
        folderId,
      );

      return this.getAllItemsList();
    } catch (error) {
      throw new Error("Failed to toggle folder");
    }
  }

  reorderFolders(req: Request & { io?: Server }, res: Response) {
    try {
      const { folderIds } = req.body;

      const stmt = db.prepare("UPDATE folders SET order_num = ? WHERE id = ?");

      db.transaction(() => {
        folderIds.forEach((id: string, index: number) => {
          stmt.run(index + 1, id);
        });
      })();

      // Get updated items list and emit
      const allItems = this.getAllItemsList();
      req.io?.emit("items:updated", allItems);

      this.getAllItems(req, res);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder folders" });
    }
  }

  // Helper method to get all items as a list
  getAllItemsList(): ItemType[] {
    const rootFiles = db
      .prepare(
        `
        SELECT
          id,
          title,
          order_num as "order",
          type,
          icon
        FROM files
        WHERE folder_id = '0'
        ORDER BY order_num
      `,
      )
      .all();

    const folders = db
      .prepare(
        `
        WITH FolderFiles AS (
          SELECT
            f.id as folder_id,
            f.title as folder_title,
            f.order_num as folder_order,
            f.type as folder_type,
            f.icon as folder_icon,
            f.is_open,
            files.id as file_id,
            files.title as file_title,
            files.order_num as file_order,
            files.type as file_type,
            files.icon as file_icon
          FROM folders f
          LEFT JOIN files ON f.id = files.folder_id
          WHERE f.id != '0'
          ORDER BY f.order_num, files.order_num
        )
        SELECT
          folder_id as id,
          folder_title as title,
          folder_order as "order",
          folder_type as type,
          folder_icon as icon,
          is_open as isOpen,
          json_group_array(
            CASE
              WHEN file_id IS NULL THEN NULL
              ELSE json_object(
                'id', file_id,
                'title', file_title,
                'order', file_order,
                'type', file_type,
                'icon', file_icon
              )
            END
          ) as items
        FROM FolderFiles
        GROUP BY folder_id
        ORDER BY folder_order
      `,
      )
      .all();

    const cleanedFolders = folders.map((folder: any) => ({
      ...folder,
      items: JSON.parse(folder.items).filter(Boolean),
    }));

    return [
      ...rootFiles.sort(
        (a, b) => (a as ItemType).order - (b as ItemType).order,
      ),
      ...cleanedFolders.sort(
        (a, b) => (a as ItemType).order - (b as ItemType).order,
      ),
    ];
  }

  getAllItems(req: Request & { io?: Server }, res: Response) {
    try {
      const allItems = this.getAllItemsList();
      res.json(allItems);
    } catch (error) {
      console.error("Error in getAllItems:", error);
      res.status(500).json({ error: "Failed to fetch items" });
    }
  }

  getAllItemsViaSockets() {
    try {
      return this.getAllItemsList();
    } catch (error) {
      console.error("Error in getAllItems:", error);
    }
  }
}

export const foldersController = new FoldersController();
