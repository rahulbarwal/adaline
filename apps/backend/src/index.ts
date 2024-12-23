import cors from "cors";
import express from "express";
import folderRoutes from "./routes/folders";
import fileRoutes from "./routes/files";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/folders", folderRoutes);
app.use("/api/files", fileRoutes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
