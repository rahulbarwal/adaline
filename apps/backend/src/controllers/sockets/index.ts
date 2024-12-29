import { ItemType, SOCKET_EVENTS } from "@adaline/shared-types";
import { Server, Socket } from "socket.io";
import { foldersController } from "../folders";
import { isTruthy } from "../../utils/validity-utils";

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
      this.io.emit(SOCKET_EVENTS.SEND_ALL_ITEMS, items);
    } catch (error) {
      console.error("Error emitting updated items to all clients:", error);
      this.io.emit(SOCKET_EVENTS.SEND_ALL_ITEMS, []);
    }
  }

  onFolderToggle(folderId: string, isOpen: boolean) {
    if (!isTruthy(folderId) || !isTruthy(isOpen)) {
      throw new Error("Invalid folderId or isOpen value");
    }
    foldersController.toggleFolder(folderId, isOpen);
  }
}
