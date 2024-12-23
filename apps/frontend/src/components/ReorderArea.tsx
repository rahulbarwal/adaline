import { ItemType } from "@adaline/shared-types";
import { useAppState } from "../context/AppStateContext";
import { useDragAndDrop } from "../context/DragAndDropContext";
import { File } from "./File";
import { Folder } from "./Folder";

export function ReorderArea() {
  const { items, reorderItems, reorderFiles, toggleFolder, transferFile } =
    useAppState();
  const { draggedItem, setIsDragging } = useDragAndDrop();

  const handleDragStart = (e: React.DragEvent, item: ItemType) => {
    draggedItem.current = item;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image
    const dragImage = e.target as HTMLElement;
    const ghost = dragImage.cloneNode(true) as HTMLElement;
    ghost.style.opacity = "0.5";
    ghost.style.position = "absolute";
    ghost.style.left = "-9999px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);

    // Clean up the ghost element after drag starts
    requestAnimationFrame(() => {
      document.body.removeChild(ghost);
    });
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    draggedItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, targetItem: ItemType) => {
    e.preventDefault();
    if (!draggedItem.current) return;

    if (draggedItem.current.type !== targetItem.type) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    const dropTarget = e.currentTarget;

    // Show drop indicator based on mouse position
    const rect = dropTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;

    dropTarget.classList.remove("border-t-2", "border-b-2", "border-blue-500");
    if (e.clientY < midY) {
      dropTarget.classList.add("border-t-2", "border-blue-500");
    } else {
      dropTarget.classList.add("border-b-2", "border-blue-500");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove(
      "border-t-2",
      "border-b-2",
      "border-blue-500"
    );
  };

  const handleDrop = async (e: React.DragEvent, targetItem: ItemType) => {
    e.preventDefault();
    e.currentTarget.classList.remove(
      "border-t-2",
      "border-b-2",
      "border-blue-500"
    );
    if (!draggedItem.current) return;

    if (draggedItem.current.type !== targetItem.type) return;

    const draggedIndex = items.findIndex(
      (item) => item.id === draggedItem.current?.id
    );
    const targetIndex = items.findIndex((item) => item.id === targetItem.id);

    if (draggedIndex === targetIndex) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const dropAfter = e.clientY > midY;

    if (draggedItem.current.type === "folder") {
      const folderItems = items.filter((item) => item.type === "folder");
      const newFolderOrder = [...folderItems];
      const draggedFolderIndex = folderItems.findIndex(
        (item) => item.id === draggedItem.current?.id
      );
      const targetFolderIndex = folderItems.findIndex(
        (item) => item.id === targetItem.id
      );

      newFolderOrder.splice(draggedFolderIndex, 1);
      const insertIndex = dropAfter ? targetFolderIndex + 1 : targetFolderIndex;
      newFolderOrder.splice(insertIndex, 0, draggedItem.current);

      await reorderItems(newFolderOrder);
    } else {
      // For files at root level
      const newOrder = dropAfter ? targetIndex + 2 : targetIndex + 1;
      if (draggedItem.current.folderId !== "0") {
        // If file is coming from a folder, transfer it to root
        await transferFile(draggedItem.current.id, "0", newOrder);
      } else {
        // If file is already at root, just reorder
        const newItems = [...items];
        newItems.splice(draggedIndex, 1);
        const insertIndex = dropAfter ? targetIndex + 1 : targetIndex;
        newItems.splice(insertIndex, 0, draggedItem.current);
        await reorderFiles("0", newItems);
      }
    }
  };

  const renderItem = (item: ItemType) => {
    const itemProps = {
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, item),
      onDragEnd: handleDragEnd,
      onDragOver: (e: React.DragEvent) => handleDragOver(e, item),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDrop(e, item),
      className: `cursor-move transition-all duration-200 ${
        draggedItem.current?.id === item.id ? "opacity-50" : "hover:bg-gray-50"
      }`,
      key: item.id,
      role: "listitem",
    };

    return (
      <div {...itemProps} key={item.id}>
        {item.type === "file" ? (
          <File {...item} />
        ) : (
          <Folder
            {...item}
            changeOrderOfChildren={reorderFiles}
            toggleFolder={toggleFolder}
          />
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-200 ${
          draggedItem.current ? "bg-gray-50 rounded-lg p-4" : ""
        }`}
        role="list"
      >
        {items.map(renderItem)}
      </div>
    </div>
  );
}
