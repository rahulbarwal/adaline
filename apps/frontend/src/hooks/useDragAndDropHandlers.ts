import { ItemType } from "@adaline/shared-types";
import { useAppState } from "../context/AppStateContext";
import { useDragAndDrop } from "../context/DragAndDropContext";

export const useDragAndDropHandlers = () => {
  const { draggedItem, setIsDragging } = useDragAndDrop();
  const { transferFile, reorderFiles, reorderItems } = useAppState();

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
        "border-blue-500"
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
      "border-blue-500"
    );
  };

  const handleFolderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("bg-yellow-50");
  };

  const handleReorder = async (
    e: React.DragEvent,
    targetItem: ItemType,
    items: ItemType[],
    options: {
      folderId: string;
      filterFn?: (item: ItemType) => boolean;
    } & (
      | {
          targetType: "file";
          reorderFn: typeof reorderFiles;
        }
      | {
          targetType: "folder";
          reorderFn: typeof reorderItems;
        }
    )
  ) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove(
      "border-t-2",
      "border-b-2",
      "border-blue-500"
    );

    if (!draggedItem.current || draggedItem.current.type !== targetItem.type)
      return;

    const itemsToReorder = options.filterFn
      ? items.filter(options.filterFn)
      : items;

    const draggedIndex = itemsToReorder.findIndex(
      (item) => item.id === draggedItem.current?.id
    );
    const targetIndex = itemsToReorder.findIndex(
      (item) => item.id === targetItem.id
    );

    if (draggedIndex === targetIndex) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const dropAfter = e.clientY > midY;

    if (
      draggedItem.current.type === "file" &&
      draggedItem.current.folderId !== options.folderId
    ) {
      const newOrder = dropAfter ? targetIndex + 2 : targetIndex + 1;
      await transferFile(draggedItem.current.id, options.folderId, newOrder);
    } else {
      const newItems = [...itemsToReorder];
      newItems.splice(draggedIndex, 1);
      const insertIndex = dropAfter ? targetIndex + 1 : targetIndex;
      newItems.splice(insertIndex, 0, draggedItem.current);
      await options.reorderFn(options.folderId, newItems);
    }
  };

  const handleDropAtRoot = async (
    e: React.DragEvent,
    targetItem: ItemType,
    items: ItemType[]
  ) => {
    if (targetItem.type === "folder") {
      await handleReorder(e, targetItem, items, {
        folderId: "0",
        reorderFn: reorderItems,
        targetType: "folder",
        filterFn: (item) => item.type === "folder",
      });
    } else {
      await handleReorder(e, targetItem, items, {
        folderId: "0",
        reorderFn: reorderFiles,
        targetType: "file",
      });
    }
  };

  const handleDropInFolder = async (
    e: React.DragEvent,
    targetItem: ItemType,
    folderId: string,
    folderItems: ItemType[]
  ) => {
    await handleReorder(e, targetItem, folderItems, {
      folderId,
      reorderFn: reorderFiles,
      targetType: "file",
    });
  };

  const handleFolderDrop = async (
    e: React.DragEvent,
    folderId: string,
    folderItems: ItemType[]
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
