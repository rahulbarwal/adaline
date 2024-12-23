import { FileType } from "@adaline/shared-types";
import { useCheckedFiles } from "../context/CheckedFilesContext";

export const File = ({ id, title, icon }: FileType) => {
  const { checkedFiles, toggleCheckedFile } = useCheckedFiles();
  const isChecked = checkedFiles.includes(id);

  const handleCheckboxChange = () => {
    toggleCheckedFile(id);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={handleCheckboxChange}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        aria-label={`Select ${title}`}
      />
      <span className="material-icons text-gray-600">{icon}</span>
      <span className="text-gray-800">{title}</span>
    </div>
  );
};
