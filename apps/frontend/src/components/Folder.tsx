import { FolderType, ItemType } from "@adaline/shared-types";
import { File } from "./File";

export function Folder({ items }: FolderType) {
  return (
    <div>
      {items.map((item: ItemType) =>
        item.type === "folder" ? <Folder {...item} /> : <File {...item} />
      )}
    </div>
  );
}
