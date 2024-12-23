import { useEffect, useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { AddFile } from "./AddFile";
import { AddFolder } from "./AddFolder";

export const AddItems = () => {
  const { checkedFiles } = useAppState();
  const [isAdding, setIsAdding] = useState<"file" | "folder" | null>(null);

  useEffect(() => {
    if (checkedFiles.length === 0) {
      setIsAdding(null);
    }
  }, [checkedFiles]);

  return (
    <div className="flex gap-4">
      {isAdding === "file" ? (
        <AddFile onCancel={() => setIsAdding(null)} onSubmit={() => {}} />
      ) : isAdding === "folder" ? (
        <AddFolder />
      ) : (
        <>
          <button
            className="p-2 px-4 flex gap-2 items-center bg-blue-200 rounded-md"
            onClick={() => setIsAdding("file")}
          >
            Add File
          </button>
          {checkedFiles.length > 0 && (
            <button
              onClick={() => setIsAdding("folder")}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
              aria-label="Create new folder with selected files"
            >
              Add Folder
            </button>
          )}
        </>
      )}
    </div>
  );
};
