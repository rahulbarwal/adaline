import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import folderRoutes from "./routes/folders";
import fileRoutes from "./routes/files";
import { SocketController } from "./controllers/sockets";
import { ItemType, SOCKET_EVENTS } from "@adaline/shared-types";
import { foldersController } from "./controllers/folders";

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

app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

// WebSocket event handlers

io.on("connection", (socket: Socket) => {
  console.log("Client connected:", socket.id);
  socketController.emitUpdatedItemsForHomePage();

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  socket.on(
    SOCKET_EVENTS.FOLDER_EVENTS.TOGGLE_FOLDER,
    ({ folderId, isOpen }) => {
      socketController.onFolderToggle(folderId, isOpen);
      socketController.emitUpdatedItemsForHomePage();
    },
  );
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
