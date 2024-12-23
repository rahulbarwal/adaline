import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconName } from "@fortawesome/fontawesome-svg-core";

interface IconPickerProps {
  icon: IconName;
  setIcon: (icon: IconName) => void;
}
export function IconPicker({ icon, setIcon }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const icons = [
    { name: "file", label: "Document" },
    { name: "file-lines", label: "Text document" },
    { name: "chart-pie", label: "Chart" },
    { name: "chart-line", label: "Graph" },
    { name: "bookmark", label: "Bookmark" },
    { name: "clipboard", label: "Clipboard" },
    { name: "thumbtack", label: "Pin" },
    { name: "paperclip", label: "Paperclip" },
    { name: "link", label: "Link" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        className="p-2 px-4 flex gap-2 items-center rounded-md"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select file icon"
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={icon} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 grid grid-cols-3 gap-2 p-2 rounded-md w-[200px] border-2 border-blue-600 bg-white">
          {icons.map((iconOption) => (
            <button
              key={iconOption.name}
              type="button"
              className="p-2 hover:bg-blue-100 rounded-md"
              onClick={() => {
                setIcon(iconOption.name as IconName);
                setIsOpen(false);
              }}
              aria-label={`Select ${iconOption.label} icon`}
            >
              <FontAwesomeIcon icon={iconOption.name as IconName} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
