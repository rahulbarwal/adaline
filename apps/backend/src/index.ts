import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { SocketController } from "./controllers/sockets";
import { SOCKET_EVENTS } from "@adaline/shared-types";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});
const socketController = new SocketController(io);

app.use(cors());
app.use(express.json());

// Inject socket.io instance into request object
app.use((req: any, res, next) => {
  req.io = io;
  next();
});

// WebSocket event handlers

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);
  socketController.emitUpdatedItemsForHomePage();

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on(SOCKET_EVENTS.FOLDER_EVENTS.REORDER_FOLDERS, ({ folderIds }) => {
    socketController.onFoldersReorder(folderIds);
    socketController.emitUpdatedItemsForHomePage();
  });

  socket.on(
    SOCKET_EVENTS.FOLDER_EVENTS.TOGGLE_FOLDER,
    ({ folderId, isOpen }) => {
      socketController.onFolderToggle(folderId, isOpen);
      socketController.emitUpdatedItemsForHomePage();
    },
  );

  socket.on(SOCKET_EVENTS.FOLDER_EVENTS.CREATE_FOLDER, ({ title, items }) => {
    socketController.onCreatedFolder(title, items);
    socketController.emitUpdatedItemsForHomePage();
  });

  socket.on(
    SOCKET_EVENTS.FILE_EVENTS.CREATE_FILE,
    ({ title, icon, folderId }) => {
      socketController.onCreatedFile(title, icon, folderId);
      socketController.emitUpdatedItemsForHomePage();
    },
  );

  socket.on(
    SOCKET_EVENTS.FILE_EVENTS.REORDER_FILES,
    ({ folderId, fileIds }) => {
      socketController.onFilesReorder(folderId, fileIds);
      socketController.emitUpdatedItemsForHomePage();
    },
  );

  socket.on(
    SOCKET_EVENTS.FILE_EVENTS.TRANSFER_FILE,
    ({ fileId, targetFolderId, newOrder }) => {
      socketController.onTransferFile(fileId, targetFolderId, newOrder);
      socketController.emitUpdatedItemsForHomePage();
    },
  );
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
