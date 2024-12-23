export type BaseItemType = {
  id: string;
  title: string;
  icon: string;
  order: number;
};

export type FileType = BaseItemType & {
  type: "file";
};

export type FolderType = BaseItemType & {
  type: "folder";
  items: (FileType | FolderType)[];
};

export type ItemType = FileType | FolderType;
