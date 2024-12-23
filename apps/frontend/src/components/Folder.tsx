import { FolderType, ItemType } from "@adaline/shared-types";
import { faFolder, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useDragAndDrop } from "../context/DragAndDropContext";
import { File } from "./File";
import { useAppState } from "../context/AppStateContext";

interface FolderProps extends FolderType {
  changeOrderOfChildren: (
    folderId: string,
    newOrder: ItemType[]
  ) => Promise<void>;
  toggleFolder: (folderId: string) => Promise<void>;
}

export function Folder({
  id,
  title,
  items,
  isOpen,
  changeOrderOfChildren,
  toggleFolder,
}: FolderProps) {
  const { draggedItem, isDragging } = useDragAndDrop();
  const { transferFile } = useAppState();

  const handleDragStart = (e: React.DragEvent, item: ItemType) => {
    e.stopPropagation();
    draggedItem.current = item;
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image
    const dragImage = e.target as HTMLElement;
    const ghost = dragImage.cloneNode(true) as HTMLElement;
    ghost.style.opacity = "0.5";
    ghost.style.position = "absolute";
    ghost.style.left = "-9999px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);

    requestAnimationFrame(() => {
      document.body.removeChild(ghost);
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    draggedItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, targetItem: ItemType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem.current || draggedItem.current.type !== "file") {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    const dropTarget = e.currentTarget;

    const rect = dropTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    dropTarget.classList.remove("border-t-2", "border-b-2", "border-blue-500");
    if (e.clientY < midY) {
      dropTarget.classList.add("border-t-2", "border-blue-500");
    } else {
      dropTarget.classList.add("border-b-2", "border-blue-500");
    }
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem.current || draggedItem.current.type !== "file") {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("bg-yellow-50");
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-yellow-50");
  };

  const handleFolderDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-yellow-50");

    if (!draggedItem.current || draggedItem.current.type !== "file") return;

    // Transfer file to this folder with the last order number
    const newOrder = items.length + 1;
    await transferFile(draggedItem.current.id, id, newOrder);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-t-2",
      "border-b-2",
      "border-blue-500"
    );
  };

  const handleDrop = async (e: React.DragEvent, targetItem: ItemType) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-t-2",
      "border-b-2",
      "border-blue-500"
    );
    if (!draggedItem.current || draggedItem.current.type !== "file") return;

    const targetIndex = items.findIndex((item) => item.id === targetItem.id);
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const dropAfter = e.clientY > midY;
    const newOrder = dropAfter ? targetIndex + 2 : targetIndex + 1;

    // If file is from another folder or root
    if (!items.find((item) => item.id === draggedItem.current?.id)) {
      await transferFile(draggedItem.current.id, id, newOrder);
    } else {
      // Reorder within the same folder
      const newItems = [...items];
      const draggedIndex = items.findIndex(
        (item) => item.id === draggedItem.current?.id
      );
      newItems.splice(draggedIndex, 1);
      const insertIndex = dropAfter ? targetIndex + 1 : targetIndex;
      newItems.splice(insertIndex, 0, draggedItem.current);
      await changeOrderOfChildren(id, newItems);
    }
  };

  return (
    <div
      className={`w-full flex flex-col gap-2 rounded-md transition-all duration-200 ${
        isDragging && draggedItem.current?.type === "file"
          ? "bg-yellow-100 shadow-lg"
          : "bg-yellow-200"
      } p-2`}
      onDragOver={handleFolderDragOver}
      onDragLeave={handleFolderDragLeave}
      onDrop={handleFolderDrop}
    >
      <div className="flex items-center gap-2 p-2 rounded-md shadow-sm cursor-pointer hover:bg-yellow-300 transition-colors duration-200">
        <FontAwesomeIcon
          icon={isOpen ? faFolderOpen : faFolder}
          onClick={() => toggleFolder(id)}
          className="transition-transform duration-200 hover:scale-110"
        />
        <span>{title}</span>
      </div>
      {!!isOpen && (
        <div className="pl-8 mt-2 p-4">
          <div
            className={`flex flex-col gap-2 transition-all duration-200 ${
              isDragging && draggedItem.current?.type === "file"
                ? "bg-yellow-50 rounded-lg p-2"
                : ""
            }`}
          >
            {items
              .filter((item) => item.type === "file")
              .map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, item)}
                  className="py-2 px-1 hover:bg-blue-50 transition-all duration-200 rounded-md"
                >
                  <File {...item} />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
