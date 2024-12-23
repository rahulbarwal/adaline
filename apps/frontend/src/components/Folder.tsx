import { FileType, FolderType } from "@adaline/shared-types";
import { Reorder } from "motion/react";
import { File } from "./File";

interface FolderProps extends FolderType {
  changeOrderOfChildren: (folderId: string, newOrder: FileType[]) => void;
}

export function Folder({
  id,
  title,
  items,
  changeOrderOfChildren,
}: FolderProps) {
  const onReorder = (newOrder: FileType[]) => {
    changeOrderOfChildren(id, newOrder);
  };
  return (
    <>
      <div>{title}</div>
      <Reorder.Group axis="y" values={items} onReorder={onReorder} as="ul">
        {items.map((item: FileType) => (
          <Reorder.Item value={item} key={item.id}>
            <File key={item.id} {...item} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </>
  );
}
