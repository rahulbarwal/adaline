import { ItemType } from "@shared-types";
import { File } from "./File";

export function Folder({ id, name, isOpen, order, items }: ItemType) {
  return (
    <div>
      {name}
      {items.map((item: ItemType) =>
        item.type === "folder" ? <Folder {...item} /> : <File {...item} />
      )}
    </div>
  );
}
