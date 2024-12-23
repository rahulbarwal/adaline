import { FileType, FolderType } from "@adaline/shared-types";
import { Reorder } from "motion/react";
import { useState } from "react";
import "./App.css";
import { Folder } from "./components/Folder";
import { AddItems } from "./components/AddItems";

function App() {
  const [items, setItems] = useState(nestedStructure);

  const onFolderReorder = (newOrder: FolderType[]) => {
    const updatedOrderIFolders = newOrder.map((item, index) => ({
      ...item,
      order: index + 1,
    }));
    setItems(updatedOrderIFolders);
  };

  const onFileReorder = (folderId: string, newOrder: FileType[]) => {
    const folder = items.find((item) => item.id === folderId);
    if (folder) {
      folder.items = newOrder;
      setItems([...items]);
    }
  };

  return (
    <div className="w-full h-full m-auto max-w-screen-lg p-8 flex flex-col gap-8">
      <AddItems />
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={onFolderReorder}
        as="div"
        className="flex flex-col gap-4 justify-start"
      >
        {items.map((item: FolderType, index: number) => (
          <Reorder.Item value={item} key={item.id} as="div">
            <Folder {...item} changeOrderOfChildren={onFileReorder} />
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

export default App;

const nestedStructure: FolderType[] = [
  {
    id: "1",
    title: "Folder 1",
    order: 1,
    type: "folder",
    icon: "folder",
    items: [
      { id: "1", title: "File 1", icon: "file", order: 1, type: "file" },
      { id: "2", title: "File 2", icon: "file", order: 2, type: "file" },
      { id: "3", title: "File 3", icon: "file", order: 3, type: "file" },
    ],
  },
  {
    id: "2",
    title: "Folder 2",
    order: 2,
    type: "folder",
    icon: "folder",
    items: [
      { id: "4", title: "File 4", icon: "file", order: 4, type: "file" },
      { id: "5", title: "File 5", icon: "file", order: 5, type: "file" },
      { id: "6", title: "File 6", icon: "file", order: 6, type: "file" },
    ],
  },
];
