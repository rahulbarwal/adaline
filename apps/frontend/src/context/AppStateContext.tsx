import { FolderType, ItemType, SOCKET_EVENTS } from "@adaline/shared-types";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { filesApi } from "../api/files";
import { socketClient } from "../socket";
import { useDragAndDrop } from "../context/DragAndDropContext";

type AppStateContextType = {
  items: ItemType[];
  reorderItems: (folderId: string, newOrder: ItemType[]) => Promise<void>;
  reorderFiles: (folderId: string, newOrder: ItemType[]) => Promise<void>;
  toggleFolder: (folderId: string) => Promise<void>;
  createFolder: (name: string, fileIds: string[]) => void;
  createFile: (name: string, icon: string) => void;
  checkedFiles: string[];
  toggleCheckedFile: (fileId: string) => void;
  clearCheckedFiles: () => void;
  error: string | null;
  transferFile: (
    fileId: string,
    targetFolderId: string,
    newOrder: number,
  ) => Promise<void>;
  updateItems: (items: ItemType[]) => Promise<void>;
};

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined,
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { draggedItem } = useDragAndDrop();

  useEffect(() => {
    socketClient.connect();
    socketClient.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("Connected to WebSocket server");
    });

    socketClient.on(SOCKET_EVENTS.ITEMS_UPDATED, (updatedItems) => {
      setItems(updatedItems);
    });

    return () => {
      console.log("Going to disconnect");
      socketClient.off(SOCKET_EVENTS.CONNECT);
      socketClient.off(SOCKET_EVENTS.ITEMS_UPDATED);
      socketClient.disconnect();
    };
  }, []);

  const handleApiError = (error: any) => {
    setError(error?.response?.data?.message || "An error occurred");
  };

  const createFile = (name: string, icon: string) => {
    try {
      socketClient.emit(SOCKET_EVENTS.FILE_EVENTS.CREATE_FILE, {
        title: name,
        icon,
        folderId: "0",
      });
    } catch (error) {
      console.error("Failed to create file:", error);
      handleApiError(error);
    }
  };

  const createFolder = (name: string, fileIds: string[]) => {
    try {
      // Get the selected files from anywhere in the hierarchy
      const selectedFiles = fileIds
        .map((fileId) => {
          let foundFile: ItemType | undefined;

          foundFile = items.find((item) => item.id === fileId);

          if (!foundFile) {
            items.forEach((item) => {
              if (item.type === "folder" && item.items) {
                const fileInFolder = item.items.find((f) => f.id === fileId);
                if (fileInFolder) foundFile = fileInFolder;
              }
            });
          }

          return foundFile;
        })
        .filter((file): file is ItemType => file !== undefined);

      socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.CREATE_FOLDER, {
        title: name,
        items: selectedFiles,
      });

      clearCheckedFiles();
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderItems = async (_: string, folders: ItemType[]) => {
    try {
      socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.REORDER_FOLDERS, {
        folderIds: folders.map((item) => item.id),
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderFiles = async (folderId: string, newOrder: ItemType[]) => {
    try {
      const fileIds = newOrder.map((file) => file.id);
      const response = await filesApi.reorderFiles(folderId, fileIds);
      setItems(response);
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleFolder = async (folderId: string) => {
    try {
      const folder = items.find(
        (item) => item.type === "folder" && item.id === folderId,
      ) as FolderType;
      if (folder) {
        socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.TOGGLE_FOLDER, {
          folderId,
          isOpen: !folder.isOpen,
        });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleCheckedFile = (fileId: string) => {
    setCheckedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const clearCheckedFiles = () => {
    setCheckedFiles([]);
  };

  const transferFile = async (
    fileId: string,
    targetFolderId: string,
    newOrder: number,
  ) => {
    try {
      const newItems = await filesApi.transferFile(
        fileId,
        targetFolderId,
        newOrder,
      );
      setItems(newItems);
    } catch (error) {
      console.error("Failed to transfer file:", error);
    }
  };

  const updateItems = async (newItems: ItemType[]) => {
    try {
      // Check if we're reordering files or folders
      if (draggedItem.current?.type === "file") {
        const rootFiles = newItems.filter((item) => item.type === "file");
        await filesApi.reorderFiles(
          "0",
          rootFiles.map((file) => file.id),
        );
      } else {
        socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.REORDER_FOLDERS, {
          folderIds: newItems.map((item) => item.id),
        });
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  return (
    <AppStateContext.Provider
      value={{
        items,
        reorderItems,
        reorderFiles,
        toggleFolder,
        createFolder,
        createFile,
        checkedFiles,
        toggleCheckedFile,
        clearCheckedFiles,
        error,
        transferFile,
        updateItems,
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider");
  }
  return context;
};
