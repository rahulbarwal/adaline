import { FolderType, ItemType } from "@adaline/shared-types";
import { faFolder, faFolderOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAppState } from "../context/AppStateContext";
import { useDragAndDrop } from "../context/DragAndDropContext";
import { File } from "./File";
import { useDragAndDropHandlers } from "../hooks/useDragAndDropHandlers";

export function ReorderArea() {
  const { items, toggleFolder } = useAppState();
  const { isDragging } = useDragAndDrop();
  const {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleFolderDragOver,
    handleFolderDragLeave,
    handleDropAtRoot,
    handleDropInFolder,
    handleFolderDrop,
    draggedItem,
  } = useDragAndDropHandlers();

  const renderFolder = (folder: FolderType) => {
    const folderProps = {
      key: folder.id,
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, folder),
      onDragEnd: handleDragEnd,
      onDragOver: (e: React.DragEvent) => {
        if (draggedItem.current?.type === "folder") {
          handleDragOver(e, folder);
        } else {
          handleFolderDragOver(e);
        }
      },
      onDragLeave: (e: React.DragEvent) => {
        handleDragLeave(e);
        handleFolderDragLeave(e);
      },
      onDrop: (e: React.DragEvent) => {
        if (draggedItem.current?.type === "folder") {
          handleDropAtRoot(e, folder, items);
        } else {
          handleFolderDrop(e, folder.id, folder.items);
        }
      },
      className: `w-full flex flex-col gap-2 rounded-md transition-all duration-200 ${
        isDragging && draggedItem.current?.type === "file"
          ? "bg-yellow-100 shadow-lg"
          : "bg-yellow-200"
      } p-2 ${
        draggedItem.current?.id === folder.id ? "opacity-50" : ""
      } cursor-move`,
    };

    return (
      <div {...folderProps} key={folder.id}>
        <div className="flex items-center gap-2 p-2 rounded-md shadow-sm cursor-pointer hover:bg-yellow-300 transition-colors duration-200">
          <FontAwesomeIcon
            icon={folder.isOpen ? faFolderOpen : faFolder}
            onClick={() => toggleFolder(folder.id)}
            className="transition-transform duration-200 hover:scale-110"
          />
          <span>{folder.title}</span>
        </div>
        {folder.isOpen && (
          <div className="pl-8 mt-2 p-4">
            <div
              className={`flex flex-col gap-2 transition-all duration-200 ${
                isDragging && draggedItem.current?.type === "file"
                  ? "bg-yellow-50 rounded-lg p-2"
                  : ""
              }`}
            >
              {folder.items
                .filter((item) => item.type === "file")
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, item)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) =>
                      handleDropInFolder(e, item, folder.id, folder.items)
                    }
                    className="py-2 px-1 hover:bg-blue-50 transition-all duration-200 rounded-md"
                  >
                    <File {...item} />
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderItem = (item: ItemType) => {
    if (item.type === "folder") {
      return renderFolder(item as FolderType);
    }

    const itemProps = {
      draggable: true,
      onDragStart: (e: React.DragEvent) => handleDragStart(e, item),
      onDragEnd: handleDragEnd,
      onDragOver: (e: React.DragEvent) => handleDragOver(e, item),
      onDragLeave: handleDragLeave,
      onDrop: (e: React.DragEvent) => handleDropAtRoot(e, item, items),
      className: `cursor-move transition-all duration-200 ${
        draggedItem.current?.id === item.id ? "opacity-50" : "hover:bg-gray-50"
      }`,
      key: item.id,
      role: "listitem",
    };

    return (
      <div {...itemProps} key={item.id}>
        <File {...item} />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`flex flex-col gap-4 transition-all duration-200 ${
          draggedItem.current ? "bg-gray-50 rounded-lg p-4" : ""
        }`}
        role="list"
      >
        {items.map(renderItem)}
      </div>
    </div>
  );
}
