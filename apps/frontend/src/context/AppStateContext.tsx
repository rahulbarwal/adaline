import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { FileType, FolderType } from "@adaline/shared-types";
import { foldersApi } from "../api/folders";
import { filesApi } from "../api/files";

type AppStateContextType = {
  // Folder related state and actions
  folders: FolderType[];
  reorderFolders: (newOrder: FolderType[]) => Promise<void>;
  reorderFiles: (folderId: string, newOrder: FileType[]) => Promise<void>;
  toggleFolder: (folderId: string) => Promise<void>;
  createFolder: (
    name: string,
    fileIds: string[]
  ) => Promise<FolderType | undefined>;
  createFile: (name: string, icon: string) => Promise<FileType | undefined>;

  // Checked files related state and actions
  checkedFiles: string[];
  toggleCheckedFile: (fileId: string) => void;
  clearCheckedFiles: () => void;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Root files related state and actions
  rootFiles: FileType[];
};

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [rootFiles, setRootFiles] = useState<FileType[]>([]);
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fetchedFolders, fetchedRootFiles] = await Promise.all([
          foldersApi.getAllFolders(),
          filesApi.getRootFiles(),
        ]);
        setFolders(fetchedFolders);
        setRootFiles(fetchedRootFiles);
        setIsLoading(false);
      } catch (error) {
        handleApiError(error);
      }
    };

    fetchData();
  }, []);

  const handleApiError = (error: any) => {
    setError(error?.response?.data?.message || "An error occurred");
    setIsLoading(false);
  };

  const createFile = async (name: string, icon: string) => {
    try {
      setIsLoading(true);
      const newFile = await filesApi.createFile({
        title: name,
        icon,
        type: "file",
        order: rootFiles.length + 1,
      });
      setRootFiles([...rootFiles, newFile]);
      setIsLoading(false);
      return newFile;
    } catch (error) {
      handleApiError(error);
    }
  };

  const createFolder = async (name: string, fileIds: string[]) => {
    try {
      setIsLoading(true);
      const newFolder = await foldersApi.createFolder({
        title: name,
        icon: "folder",
        type: "folder",
        order: folders.length + 1,
        isOpen: true,
        items: [],
      });
      setFolders([...folders, newFolder]);
      clearCheckedFiles();
      setIsLoading(false);
      return newFolder;
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderFolders = async (newOrder: FolderType[]) => {
    try {
      setIsLoading(true);
      const folderIds = newOrder.map((folder) => folder.id);
      const updatedFolders = await foldersApi.reorderFolders(folderIds);
      setFolders(updatedFolders);
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const reorderFiles = async (folderId: string, newOrder: FileType[]) => {
    try {
      setIsLoading(true);
      const fileIds = newOrder.map((file) => file.id);
      const updatedFiles = await filesApi.reorderFiles(folderId, fileIds);
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        folder.items = updatedFiles;
        setFolders([...folders]);
      }
      setIsLoading(false);
    } catch (error) {
      handleApiError(error);
    }
  };

  const toggleFolder = async (folderId: string) => {
    try {
      setIsLoading(true);
      const folder = folders.find((f) => f.id === folderId);
      if (folder) {
        const updatedFolder = await foldersApi.toggleFolder(
          folderId,
          !folder.isOpen
        );
        setFolders(folders.map((f) => (f.id === folderId ? updatedFolder : f)));
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

  return (
    <AppStateContext.Provider
      value={{
        folders,
        rootFiles,
        reorderFolders,
        reorderFiles,
        toggleFolder,
        createFolder,
        createFile,
        checkedFiles,
        toggleCheckedFile,
        clearCheckedFiles,
        isLoading,
        error,
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
