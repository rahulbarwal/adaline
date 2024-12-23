import { Reorder } from "motion/react";
import { ReactNode } from "react";
import { useAppState } from "../context/AppStateContext";
import { FolderType } from "@adaline/shared-types";
import { Folder } from "./Folder";

export function ReorderArea() {
  const { folders, reorderFolders, reorderFiles, toggleFolder } = useAppState();
  return (
    <Reorder.Group
      axis="y"
      values={folders}
      onReorder={reorderFolders}
      as="div"
      className="flex flex-col gap-4 justify-start"
    >
      {folders.map((item: FolderType) => (
        <Reorder.Item value={item} key={item.id} as="div">
          <Folder
            {...item}
            changeOrderOfChildren={reorderFiles}
            toggleFolder={toggleFolder}
          />
        </Reorder.Item>
      ))}
    </Reorder.Group>
  );
}
