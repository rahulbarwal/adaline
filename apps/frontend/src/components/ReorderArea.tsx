import { Reorder, useDragControls } from "motion/react";
import { useAppState } from "../context/AppStateContext";
import { FolderType } from "@adaline/shared-types";
import { Folder } from "./Folder";
import { useState, useEffect } from "react";

export function ReorderArea() {
  const { folders, reorderFolders, reorderFiles, toggleFolder } = useAppState();
  const controls = useDragControls();

  const [localFolders, setLocalFolders] = useState<FolderType[]>(folders);

  useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  const handleReorder = (newOrder: FolderType[]) => {
    setLocalFolders(newOrder);
  };

  const handleDragEnd = async () => {
    // Only make the API call when drag ends
    if (JSON.stringify(localFolders) !== JSON.stringify(folders)) {
      await reorderFolders(localFolders);
    }
  };

  return (
    <Reorder.Group
      axis="y"
      values={localFolders}
      onReorder={handleReorder}
      dragControls={controls}
      onDragEnd={handleDragEnd}
      as="div"
      className="flex flex-col gap-4 justify-start"
    >
      {localFolders.map((item: FolderType) => (
        <Reorder.Item value={item} key={item.id} as="div">
          <Folder
            {...item}
            changeOrderOfChildren={reorderFiles}
            toggleFolder={toggleFolder}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
