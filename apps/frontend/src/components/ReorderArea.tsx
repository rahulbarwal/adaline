import { Reorder, useDragControls } from "motion/react";
import { useAppState } from "../context/AppStateContext";
import { FolderType, FileType } from "@adaline/shared-types";
import { Folder } from "./Folder";
import { useState, useEffect } from "react";
import { File } from "./File";

export function ReorderArea() {
  const { folders, rootFiles, reorderFolders, reorderFiles, toggleFolder } =
    useAppState();
  const controls = useDragControls();

  const [localFolders, setLocalFolders] = useState<FolderType[]>(folders);
  const [localRootFiles, setLocalRootFiles] = useState<FileType[]>(rootFiles);

  useEffect(() => {
    setLocalFolders(folders);
  }, [folders]);

  useEffect(() => {
    setLocalRootFiles(rootFiles);
  }, [rootFiles]);

  const handleReorder = (newOrder: FolderType[]) => {
    setLocalFolders(newOrder);
  };

  const handleRootFilesReorder = (newOrder: FileType[]) => {
    setLocalRootFiles(newOrder);
  };

  const handleDragEnd = async () => {
    if (JSON.stringify(localFolders) !== JSON.stringify(folders)) {
      await reorderFolders(localFolders);
    }
  };

  const handleRootFilesDragEnd = async () => {
    if (JSON.stringify(localRootFiles) !== JSON.stringify(rootFiles)) {
      await reorderFiles("0", localRootFiles);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Root Files Section */}
      <Reorder.Group
        axis="y"
        values={localRootFiles}
        onReorder={handleRootFilesReorder}
        dragControls={controls}
        onDragEnd={handleRootFilesDragEnd}
        as="div"
        className="flex flex-col gap-2"
      >
        {localRootFiles.map((file) => (
          <Reorder.Item value={file} key={file.id} as="div">
            <File {...file} />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Folders Section */}
      <Reorder.Group
        axis="y"
        values={localFolders}
        onReorder={handleReorder}
        dragControls={controls}
        onDragEnd={handleDragEnd}
        as="div"
        className="flex flex-col gap-4"
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
    </div>
  );
}
