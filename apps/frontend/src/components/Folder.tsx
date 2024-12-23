import { FileType, FolderType } from "@adaline/shared-types";
import { faFolder, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Reorder, useDragControls } from "motion/react";
import { useEffect, useState } from "react";
import { File } from "./File";

interface FolderProps extends FolderType {
  changeOrderOfChildren: (
    folderId: string,
    newOrder: FileType[]
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
  const controls = useDragControls();
  const [localItems, setLocalItems] = useState<FileType[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleFilesReorder = (newOrder: FileType[]) => {
    setLocalItems(newOrder);
  };

  const handleFileDragEnd = async () => {
    if (JSON.stringify(localItems) !== JSON.stringify(items)) {
      await changeOrderOfChildren(id, localItems);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 rounded-md bg-yellow-200 p-2">
      <div
        className="flex items-center gap-2 p-2 rounded-md shadow-sm cursor-pointer"
        onClick={() => toggleFolder(id)}
      >
        <FontAwesomeIcon icon={isOpen ? faFolderOpen : faFolder} />
        <span>{title}</span>
      </div>
      {isOpen && (
        <div className="pl-8 mt-2">
          <Reorder.Group
            axis="y"
            values={localItems}
            onReorder={handleFilesReorder}
            dragControls={controls}
            onDragEnd={handleFileDragEnd}
            as="div"
            className="flex flex-col gap-2"
          >
            {localItems.map((item) => (
              <Reorder.Item value={item} key={item.id} as="div">
                <File {...item} />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
