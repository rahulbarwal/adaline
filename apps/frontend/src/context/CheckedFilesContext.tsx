import { createContext, useContext, useState, ReactNode } from "react";

type CheckedFilesContextType = {
  checkedFiles: string[];
  toggleCheckedFile: (fileId: string) => void;
  clearCheckedFiles: () => void;
};

const CheckedFilesContext = createContext<CheckedFilesContextType | undefined>(
  undefined
);

export function CheckedFilesProvider({ children }: { children: ReactNode }) {
  const [checkedFiles, setCheckedFiles] = useState<string[]>([]);

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
    <CheckedFilesContext.Provider
      value={{ checkedFiles, toggleCheckedFile, clearCheckedFiles }}
    >
      {children}
    </CheckedFilesContext.Provider>
  );
}

export const useCheckedFiles = () => {
  const context = useContext(CheckedFilesContext);
  if (context === undefined) {
    throw new Error(
      "useCheckedFiles must be used within a CheckedFilesProvider"
    );
  }
  return context;
};
