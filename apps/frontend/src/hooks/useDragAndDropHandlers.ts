import { ItemType } from "@adaline/shared-types";
import { useAppState } from "../context/AppStateContext";
import { useDragAndDrop } from "../context/DragAndDropContext";

export const useDragAndDropHandlers = () => {
  const { draggedItem, setIsDragging } = useDragAndDrop();
  const { transferFile, updateItems } = useAppState();

  const handleDragStart = (e: React.DragEvent, item: ItemType) => {
    e.stopPropagation();
    draggedItem.current = item;
    setIsDragging?.(true);
    e.dataTransfer.effectAllowed = "move";

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
    setIsDragging?.(false);
    draggedItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, targetItem: ItemType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem.current) {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    if (
      (draggedItem.current.type === "file" && targetItem.type === "file") ||
      (draggedItem.current.type === "folder" && targetItem.type === "folder")
    ) {
      e.dataTransfer.dropEffect = "move";
      const dropTarget = e.currentTarget;

      const rect = dropTarget.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      dropTarget.classList.remove(
        "border-t-2",
        "border-b-2",
        "border-blue-500",
      );
      if (e.clientY < midY) {
        dropTarget.classList.add("border-t-2", "border-blue-500");
      } else {
        dropTarget.classList.add("border-b-2", "border-blue-500");
      }
    } else {
      e.dataTransfer.dropEffect = "none";
    }
  };

  const handleFolderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedItem.current || draggedItem.current.type === "folder") {
      e.dataTransfer.dropEffect = "none";
      return;
    }

    e.dataTransfer.dropEffect = "move";
    e.currentTarget.classList.add("bg-yellow-50");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-t-2",
      "border-b-2",
      "border-blue-500",
    );
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-yellow-50");
  };

  const handleDropAtRoot = (
    e: React.DragEvent,
    targetItem: ItemType,
    items: ItemType[],
  ) => {
    e.preventDefault();

    if (!draggedItem.current) return;

    const draggedItemId = draggedItem.current.id;
    if (draggedItemId === targetItem.id) return;

    // Get drop position relative to target item's center
    const targetRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isDropAfter = e.clientY > targetRect.top + targetRect.height / 2;

    // Remove dragged item from its current position
    const newItems = items.filter((item) => item.id !== draggedItemId);

    // Find target index
    const targetIndex = newItems.findIndex((item) => item.id === targetItem.id);

    // Insert dragged item at the correct position
    const insertIndex = isDropAfter ? targetIndex + 1 : targetIndex;
    newItems.splice(insertIndex, 0, draggedItem.current);

    if (draggedItem.current && draggedItem.current.type === "file") {
      transferFile(draggedItem.current.id, "0", insertIndex + 1);
    } else {
      // Update state with new order
      updateItems(newItems);
    }

    // Reset drag state
    draggedItem.current = null;
    setIsDragging(false);
  };

  const handleDropInFolder = async (
    e: React.DragEvent,
    targetItem: ItemType,
    folderId: string,
    folderItems: ItemType[],
  ) => {
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave(e);

    if (!draggedItem.current || draggedItem.current.type !== "file") return;

    const targetRect = e.currentTarget.getBoundingClientRect();
    const isDropAfter = e.clientY > targetRect.top + targetRect.height / 2;

    // Get only files from folder items
    const fileItems = folderItems.filter((item) => item.type === "file");

    let newOrder;
    if (fileItems.length === 0) {
      newOrder = 1;
    } else {
      // Find target index among files
      const targetIndex = fileItems.findIndex(
        (item) => item.id === targetItem.id,
      );

      // When dropping after, we want the position after the target
      // When dropping before, we want the target's position
      newOrder = isDropAfter ? targetIndex + 2 : targetIndex + 1;
    }

    await transferFile(draggedItem.current.id, folderId, newOrder);
    draggedItem.current = null;
    setIsDragging(false);
  };

  const handleFolderDrop = async (
    e: React.DragEvent,
    folderId: string,
    folderItems: ItemType[],
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-yellow-50");

    if (!draggedItem.current || draggedItem.current.type !== "file") return;

    const newOrder = folderItems.length + 1;
    await transferFile(draggedItem.current.id, folderId, newOrder);
  };

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleFolderDragOver,
    handleFolderDragLeave,
    handleDropAtRoot,
    handleDropInFolder,
    handleFolderDrop,
    draggedItem,
  };
};
