export { SOCKET_EVENTS } from "./socketEventConstants";

export type BaseItemType = {
  id: string;
  title: string;
  icon: string;
  order: number;
};

export type FileType = BaseItemType & {
  type: "file";
  folderId: string;
};

export type FolderType = BaseItemType & {
  type: "folder";
  isOpen: boolean;
  items: (FileType | FolderType)[];
};

export type ItemType = FileType | FolderType;
