import { FileType, ItemType, SOCKET_EVENTS } from "@adaline/shared-types";
import { Server, Socket } from "socket.io";
import { foldersController } from "../folders";
import { isTruthy } from "../../utils/validity-utils";
import { filesController } from "../files";

export class SocketController {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    this.onFolderToggle = this.onFolderToggle.bind(this);
    this.emitUpdatedItemsForHomePage =
      this.emitUpdatedItemsForHomePage.bind(this);
  }

  emitUpdatedItemsForHomePage() {
    try {
      const items = foldersController.getAllItemsViaSockets();
      this.io.emit(SOCKET_EVENTS.ITEMS_UPDATED, items);
    } catch (error) {
      console.error("Error emitting updated items to all clients:", error);
      this.io.emit(SOCKET_EVENTS.ITEMS_UPDATED, []);
    }
  }

  onFoldersReorder(folderIds: string[]) {
    if (!isTruthy(folderIds) && !Array.isArray(folderIds)) {
      throw new Error("Invalid folderIds value");
    }
    foldersController.reorderFolders(folderIds);
  }

  onFolderToggle(folderId: string, isOpen: boolean) {
    if (!isTruthy(folderId) || !isTruthy(isOpen)) {
      throw new Error("Invalid folderId or isOpen value");
    }
    foldersController.toggleFolder(folderId, isOpen);
  }

  onCreatedFolder(title: string, items: FileType[]) {
    if (!isTruthy(title) || (!isTruthy(items) && !Array.isArray(items))) {
      throw new Error("Invalid title or items");
    }
    foldersController.createFolder(title, items);
  }

  // #region File Operations
  onCreatedFile(title: string, icon: string, folderId: string) {
    if (!isTruthy(title) || !isTruthy(icon)) {
      throw new Error("Invalid title, icon or folderId");
    }
    filesController.createFile(title, icon, folderId);
  }

  onFilesReorder(folderId: string, fileIds: string[]) {
    if (
      !isTruthy(folderId) ||
      (!isTruthy(fileIds) && !Array.isArray(fileIds))
    ) {
      throw new Error("Invalid folderId or fileIds");
    }
    filesController.reorderFiles(folderId, fileIds);
  }

  onTransferFile(fileId: string, targetFolderId: string, newOrder: number) {
    if (!isTruthy(fileId) || !isTruthy(targetFolderId) || !isTruthy(newOrder)) {
      throw new Error("Invalid fileId, targetFolderId or newOrder");
    }
    filesController.transferFile(fileId, targetFolderId, newOrder);
  }
  // #endregion
}
