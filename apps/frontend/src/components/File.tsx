import { FileType } from "@adaline/shared-types";
import { useAppState } from "../context/AppStateContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

export const File = ({ id, title, icon }: FileType) => {
  const { checkedFiles, toggleCheckedFile } = useAppState();
  const isChecked = checkedFiles.includes(id);
  return (
    <div className="flex items-center gap-2 p-2 bg-white rounded-md shadow-sm">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={() => toggleCheckedFile(id)}
        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
        aria-label={`Select ${title}`}
      />
      <FontAwesomeIcon icon={icon as IconProp} />
      <span className="text-gray-800">{title}</span>
    </div>
  );
};
