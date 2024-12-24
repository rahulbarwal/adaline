import { FolderType, ItemType } from "@adaline/shared-types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { filesApi } from "../api/files";
import { foldersApi } from "../api/folders";
import { io } from "socket.io-client";

type AppStateContextType = {
  items: ItemType[];
  reorderItems: (folderId: string, newOrder: ItemType[]) => Promise<void>;
  reorderFiles: (folderId: string, newOrder: ItemType[]) => Promise<void>;
  toggleFolder: (folderId: string) => Promise<void>;
  createFolder: (
    name: string,
    fileIds: string[]
  ) => Promise<ItemType[] | undefined>;
  createFile: (name: string, icon: string) => Promise<ItemType[] | undefined>;
  checkedFiles: string[];
  toggleCheckedFile: (fileId: string) => void;
  clearCheckedFiles: () => void;
  isLoading: boolean;
  error: string | null;
  transferFile: (
    fileId: string,
    targetFolderId: string,
    newOrder: number
  ) => Promise<void>;
};

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ItemType[]>([]);
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await foldersApi.getAllFolders();
        setItems(response);
        setIsLoading(false);
      } catch (error) {
        handleApiError(error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("items:updated", (updatedItems) => {
      setItems(updatedItems);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleApiError = (error: any) => {
    setError(error?.response?.data?.message || "An error occurred");
    setIsLoading(false);
  };

  const createFile = async (name: string, icon: string) => {
    try {
      setIsLoading(true);
      const newItems = await filesApi.createFile({
        title: name,
        icon,
        type: "file",
        order: items.filter((item) => item.type === "file").length + 1,
        folderId: "0",
      });
      setItems(newItems);
      setIsLoading(false);
      return newItems;
    } catch (error) {
      handleApiError(error);
    }
  };

  const createFolder = async (name: string, fileIds: string[]) => {
    try {
      setIsLoading(true);
      const allItems = await foldersApi.createFolder({
        title: name,
        icon: "folder",
        type: "folder",
        order: items.filter((item) => item.type === "folder").length + 1,
        isOpen: true,
        items: items.filter((item) => fileIds.includes(item.id)),
      });
      setItems(allItems);
      clearCheckedFiles();
      setIsLoading(false);
      return allItems;
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderItems = async (_: string, newOrder: ItemType[]) => {
    try {
      setIsLoading(true);
      const response = await foldersApi.reorderFolders(newOrder);
      setItems(response);
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderFiles = async (folderId: string, newOrder: ItemType[]) => {
    try {
      setIsLoading(true);
      const fileIds = newOrder.map((file) => file.id);
      const response = await filesApi.reorderFiles(folderId, fileIds);
      setItems(response);
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleFolder = async (folderId: string) => {
    try {
      setIsLoading(true);
      const folder = items.find(
        (item) => item.type === "folder" && item.id === folderId
      ) as FolderType;
      if (folder) {
        const response = await foldersApi.toggleFolder(
          folderId,
          !folder.isOpen
        );
        setItems(response);
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
        : [...prev, fileId]
    );
  };

  const clearCheckedFiles = () => {
    setCheckedFiles([]);
  };

  const transferFile = async (
    fileId: string,
    targetFolderId: string,
    newOrder: number
  ) => {
    try {
      const newItems = await filesApi.transferFile(
        fileId,
        targetFolderId,
        newOrder
      );
      setItems(newItems);
    } catch (error) {
      console.error("Failed to transfer file:", error);
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
