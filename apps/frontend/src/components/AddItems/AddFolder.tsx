import { useState } from "react";
import { useAppState } from "../../context/AppStateContext";

export const AddFolder = () => {
  const { createFolder, checkedFiles, isLoading, items } = useAppState();
  const [name, setName] = useState("");

  const getSelectedFilesCount = () => {
    return checkedFiles.length;
  };

  const handleCreateFolder = async () => {
    if (!name.trim()) return;
    await createFolder(name, checkedFiles);
    setName("");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <input
          autoFocus
          type="text"
          placeholder="Folder name"
          className="p-2 px-4 flex gap-2 items-center rounded-md w-full border-2 border-blue-600"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="p-2 px-4 flex gap-2 items-center bg-blue-200 rounded-md disabled:opacity-50"
          onClick={handleCreateFolder}
          disabled={isLoading || !name.trim()}
        >
          {isLoading ? "Creating..." : "Submit"}
        </button>
      </div>
      {checkedFiles.length > 0 && (
        <p className="text-sm text-gray-600">
          Selected {getSelectedFilesCount()} file(s) will be moved to the new
          folder
        </p>
      )}
    </div>
  );
};
