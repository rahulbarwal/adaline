import { useState } from "react";
import { IconPicker } from "./IconPicker";
import { IconName } from "@fortawesome/fontawesome-svg-core";
interface AddFileProps {
  onCancel: () => void;
  onSubmit: (name: string) => void;
}
export function AddFile({ onCancel, onSubmit }: AddFileProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<IconName>("file");
  return (
    <div className="flex flex-row gap-2 items-center">
      <input
        type="text"
        placeholder="File name"
        className="p-2 px-4 flex gap-2 items-center rounded-md w-1/3 border-2 border-blue-600"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <IconPicker icon={icon} setIcon={setIcon} />
      <button
        className="p-2 px-4 flex gap-2 items-center bg-blue-200 rounded-md"
        onClick={() => onSubmit(name)}
      >
        Submit
      </button>
      <button
        className="p-2 px-4 flex gap-2 items-center bg-red-200 rounded-md"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
}
