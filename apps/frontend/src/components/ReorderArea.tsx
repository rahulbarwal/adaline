import { FileType, ItemType } from "@adaline/shared-types";
import { Reorder, useDragControls } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useAppState } from "../context/AppStateContext";
import { File } from "./File";
import { Folder } from "./Folder";

export function ReorderArea() {
  const { items, reorderItems, reorderFiles, toggleFolder } = useAppState();
  const controls = useDragControls();

  const [localItems, setLocalItems] = useState<ItemType[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleReorder = (newItems: ItemType[]) => {
    setLocalItems(newItems);
  };

  useEffect(() => {
    (async () => {
      if (JSON.stringify(localItems) !== JSON.stringify(items)) {
        await reorderItems(localItems);
      }
    })();
  }, [localItems, items, reorderItems]);

  const handleFilesReorder = async (folderId: string, newOrder: ItemType[]) => {
    await reorderFiles(folderId, newOrder);
  };

  const renderItem = (item: ItemType) => {
    if (item.type === "file") {
      return (
        <Reorder.Item value={item} key={item.id} as="div">
          <File {...item} />
        </Reorder.Item>
      );
    }

    return (
      <Reorder.Item value={item} key={item.id} as="div">
        <Folder
          {...item}
          changeOrderOfChildren={handleFilesReorder}
          toggleFolder={toggleFolder}
        />
      </Reorder.Item>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Reorder.Group
        axis="y"
        values={localItems}
        onReorder={handleReorder}
        dragControls={controls}
        as="div"
        className="flex flex-col gap-4"
      >
        {localItems.map(renderItem)}
      </Reorder.Group>
    </div>
  );
}
