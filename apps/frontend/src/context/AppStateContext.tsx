import { createContext, useContext, useState, ReactNode } from "react";
import { FileType, FolderType } from "@adaline/shared-types";

type AppStateContextType = {
  // Folder related state and actions
  folders: FolderType[];
  reorderFolders: (newOrder: FolderType[]) => void;
  reorderFiles: (folderId: string, newOrder: FileType[]) => void;
  toggleFolder: (folderId: string) => void;

  // Checked files related state and actions
  checkedFiles: string[];
  toggleCheckedFile: (fileId: string) => void;
  clearCheckedFiles: () => void;
};

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

const initialFolders: FolderType[] = [
  {
    id: "1",
    title: "Folder 1",
    order: 1,
    type: "folder",
    icon: "folder",
    isOpen: true,
    items: [
      { id: "1", title: "File 1", icon: "file", order: 1, type: "file" },
      { id: "2", title: "File 2", icon: "file", order: 2, type: "file" },
      { id: "3", title: "File 3", icon: "file", order: 3, type: "file" },
    ],
  },
  {
    id: "2",
    title: "Folder 2",
    order: 2,
    type: "folder",
    icon: "folder",
    isOpen: true,
    items: [
      { id: "4", title: "File 4", icon: "file", order: 4, type: "file" },
      { id: "5", title: "File 5", icon: "file", order: 5, type: "file" },
      { id: "6", title: "File 6", icon: "file", order: 6, type: "file" },
    ],
  },
];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<FolderType[]>(initialFolders);
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);

  const reorderFolders = (newOrder: FolderType[]) => {
    const updatedOrderFolders = newOrder.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setFolders(updatedOrderFolders);
  };

  const reorderFiles = (folderId: string, newOrder: FileType[]) => {
    const folder = folders.find((item) => item.id === folderId);
    if (folder) {
      folder.items = newOrder;
      setFolders([...folders]);
    }
  };

  const toggleFolder = (folderId: string) => {
    const folder = folders.find((item) => item.id === folderId);
    if (folder) {
      folder.isOpen = !folder.isOpen;
      setFolders([...folders]);
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
        reorderFolders,
        reorderFiles,
        toggleFolder,
        checkedFiles,
        toggleCheckedFile,
        clearCheckedFiles,
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
