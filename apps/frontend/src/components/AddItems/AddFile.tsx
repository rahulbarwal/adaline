import { useState } from "react";
import { useAppState } from "../../context/AppStateContext";

interface AddFileProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export const AddFile = ({ onCancel }: AddFileProps) => {
  const { createFile, isLoading } = useAppState();
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await createFile(name, "file");
    setName("");
    onCancel();
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      <input
        type="text"
        placeholder="File name"
        className="p-2 px-4 flex gap-2 items-center rounded-md w-full border-2 border-blue-600"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        className="p-2 px-4 flex gap-2 items-center bg-blue-200 rounded-md disabled:opacity-50"
        onClick={handleSubmit}
        disabled={isLoading || !name.trim()}
      >
        {isLoading ? "Creating..." : "Submit"}
      </button>
      <button
        className="p-2 px-4 flex gap-2 items-center bg-red-200 rounded-md"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};
