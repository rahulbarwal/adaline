import { FileType } from "@shared-types";

export function File({ id, title, icon, order, folderId }: FileType) {
  return <div>{title}</div>;
}
