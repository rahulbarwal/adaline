export interface DBFolder {
  id: string;
  title: string;
  order_num: number;
  type: string;
  icon: string;
  is_open: boolean;
}

export interface DBFile {
  id: string;
  folder_id: string;
  title: string;
  order_num: number;
  type: string;
  icon: string;
}
