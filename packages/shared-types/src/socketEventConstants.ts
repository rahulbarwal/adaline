export const SOCKET_EVENTS = {
  FOLDER_EVENTS: {
    TOGGLE_FOLDER: "folder:toggle",
    CREATE_FOLDER: "folder:create",
    REORDER_FOLDERS: "folder:reorder",
  },
  SEND_ALL_ITEMS: "items:updated",
} as const;
