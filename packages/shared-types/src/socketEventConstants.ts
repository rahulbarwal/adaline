export const SOCKET_EVENTS = {
  FOLDER_EVENTS: {
    TOGGLE_FOLDER: "folder:toggle",
    CREATE_FOLDER: "folder:create",
    REORDER_FOLDERS: "folder:reorder",
  },
  FILE_EVENTS: {
    CREATE_FILE: "file:create",
  },
  ITEMS_UPDATED: "items:updated",
  CONNECT: "connect",
} as const;
