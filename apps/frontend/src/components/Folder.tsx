import { FileType, FolderType } from "@adaline/shared-types";
import { Reorder } from "motion/react";
import { File } from "./File";

interface FolderProps extends FolderType {
  changeOrderOfChildren: (folderId: string, newOrder: FileType[]) => void;
  toggleFolder: (folderId: string) => void;
}

export function Folder({
  id,
  title,
  items,
  changeOrderOfChildren,
  isOpen,
  toggleFolder,
}: FolderProps) {
  const onReorder = (newOrder: FileType[]) => {
    changeOrderOfChildren(id, newOrder);
  };
  return (
    <div className="flex flex-col gap-2 rounded-md bg-yellow-200 p-2">
      <strong
        className="text-lg flex flex-row gap-2 items-center text-yellow-800"
        onClick={() => toggleFolder(id)}
      >
        <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
        {title}
      </strong>
      {isOpen && (
        <Reorder.Group axis="y" values={items} onReorder={onReorder} as="div">
          {items.map((item: FileType) => (
            <Reorder.Item value={item} key={item.id} as="div">
              <File key={item.id} {...item} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
