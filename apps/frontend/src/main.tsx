import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faFile,
  faFileLines,
  faChartPie,
  faChartLine,
  faBookmark,
  faClipboard,
  faThumbtack,
  faPaperclip,
  faLink,
  faFolder,
  faFolderOpen,
} from "@fortawesome/free-solid-svg-icons";
import "./index.css";
import App from "./App.tsx";

library.add(
  faFile,
  faFileLines,
  faChartPie,
  faChartLine,
  faBookmark,
  faClipboard,
  faThumbtack,
  faPaperclip,
  faLink,
  faFolder,
  faFolderOpen
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
