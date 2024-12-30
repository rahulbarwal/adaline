import { useState } from "react";
import { useAppState } from "../../context/AppStateContext";
import { IconPicker } from "./IconPicker";
import { IconName } from "@fortawesome/fontawesome-svg-core";

interface AddFileProps {
  onCancel: () => void;
  onSubmit: () => void;
}

export const AddFile = ({ onCancel }: AddFileProps) => {
  const { createFile, isLoading } = useAppState();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("file");
  const handleSubmit = async () => {
    if (!name.trim()) return;
    createFile(name, icon);
    setName("");
    onCancel();
  };

  return (
    <div className="flex flex-row gap-2 items-center">
      <input
        autoFocus
        type="text"
        placeholder="File name"
        className="p-2 px-4 flex gap-2 items-center rounded-md w-full border-2 border-blue-600"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <IconPicker icon={icon as IconName} setIcon={setIcon} />
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
