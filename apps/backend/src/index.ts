import cors from "cors";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import folderRoutes from "./routes/folders";
import fileRoutes from "./routes/files";
import { foldersController } from "./controllers/folders";
import { isTruthy } from "./validity-utils";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

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
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on(
    "folder:toggle",
    ({ folderId, isOpen }: { folderId: string; isOpen: boolean }) => {
      if (!isTruthy(folderId) || !isTruthy(isOpen)) {
        throw new Error("Invalid folderId or isOpen value");
      }
      io.emit(
        "items:updated",
        foldersController.toggleFolder(folderId, isOpen),
      );
    },
  );

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
