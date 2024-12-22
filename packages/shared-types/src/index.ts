export interface ItemType {
  id: string;
  title: string;
  icon: string;
  order: number;
  folderId: string | null;
}

export interface FolderType {
  id: string;
  name: string;
  isOpen: boolean;
  order: number;
}
