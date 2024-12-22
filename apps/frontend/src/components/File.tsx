import { ItemType } from "@shared-types";

export function File({ id, title, icon, order, folderId }: ItemType) {
  return <div>{title}</div>;
}
