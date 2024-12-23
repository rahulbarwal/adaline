import { useAppState } from "../../context/AppStateContext";

export const AddFolder = () => {
  const { clearCheckedFiles } = useAppState();

  const handleCreateFolder = () => {
    // Create folder logic here using checkedFiles array
    // After creating folder, clear the checked files
    clearCheckedFiles();
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      <input
        type="text"
        placeholder="Folder name"
        className="p-2 px-4 flex gap-2 items-center rounded-md w-full border-2 border-blue-600"
      />
      <button
        className="p-2 px-4 flex gap-2 items-center bg-blue-200 rounded-md"
        onClick={handleCreateFolder}
      >
        Submit
      </button>
    </div>
  );
};
