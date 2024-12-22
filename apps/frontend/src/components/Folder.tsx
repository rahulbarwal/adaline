import { FolderType } from "@shared-types";

export function Folder({ id, name, isOpen, order }: FolderType) {
  return <div>{name}</div>;
}
