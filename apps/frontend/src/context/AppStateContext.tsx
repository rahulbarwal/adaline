import { FolderType, ItemType, SOCKET_EVENTS } from "@adaline/shared-types";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
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
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
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
    console.error(error);
    setError(error?.response?.data?.message || "An error occurred");
    setIsLoading(false);
  };

  const createFile = (name: string, icon: string) => {
    try {
      setIsLoading(true);
      socketClient.emit(SOCKET_EVENTS.FILE_EVENTS.CREATE_FILE, {
        title: name,
        icon,
        folderId: "0",
      });

      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const createFolder = (name: string, fileIds: string[]) => {
    try {
      setIsLoading(true);

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
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderItems = async (_: string, folders: ItemType[]) => {
    try {
      setIsLoading(true);
      socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.REORDER_FOLDERS, {
        folderIds: folders.map((item) => item.id),
      });
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderFiles = async (folderId: string, newOrder: ItemType[]) => {
    try {
      setIsLoading(true);
      const fileIds = newOrder.map((file) => file.id);

      socketClient.emit(SOCKET_EVENTS.FILE_EVENTS.REORDER_FILES, {
        folderId,
        fileIds,
      });
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleFolder = async (folderId: string) => {
    try {
      setIsLoading(true);
      const folder = items.find(
        (item) => item.type === "folder" && item.id === folderId,
      ) as FolderType;
      if (folder) {
        socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.TOGGLE_FOLDER, {
          folderId,
          isOpen: !folder.isOpen,
        });
      }
      setIsLoading(false);
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
      socketClient.emit(SOCKET_EVENTS.FILE_EVENTS.TRANSFER_FILE, {
        fileId,
        targetFolderId,
        newOrder,
      });
    } catch (error) {
      handleApiError(error);
    }
  };

  const updateItems = async (newItems: ItemType[]) => {
    try {
      setIsLoading(true);

      // Check if we're reordering files or folders
      if (draggedItem.current?.type === "file") {
        const rootFiles = newItems.filter((item) => item.type === "file");
        socketClient.emit(SOCKET_EVENTS.FILE_EVENTS.REORDER_FILES, {
          folderId: "0",
          fileIds: rootFiles.map((file) => file.id),
        });
      } else {
        socketClient.emit(SOCKET_EVENTS.FOLDER_EVENTS.REORDER_FOLDERS, {
          folderIds: newItems.map((item) => item.id),
        });
      }

      setIsLoading(false);
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
        isLoading,
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
