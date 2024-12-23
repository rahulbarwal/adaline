import "./App.css";
import { Folder } from "./components/Folder";

function App() {
  return (
    <>
      <Folder {...nestedStructure} />
    </>
  );
}

export default App;

const nestedStructure = {
  id: "0",
  name: "Root Folder",
  order: 0,
  type: "folder",
  items: [
    {
      id: "1",
      name: "Folder 1",
      order: 1,
      type: "folder",
      items: [
        { id: "1", title: "File 1", icon: "file", order: 1, type: "file" },
        { id: "2", title: "File 2", icon: "file", order: 2, type: "file" },
        { id: "3", title: "File 3", icon: "file", order: 3, type: "file" },
      ],
    },
    {
      id: "2",
      name: "Folder 2",
      order: 2,
      type: "folder",
      items: [
        { id: "4", title: "File 4", icon: "file", order: 4, type: "file" },
        { id: "5", title: "File 5", icon: "file", order: 5, type: "file" },
        { id: "6", title: "File 6", icon: "file", order: 6, type: "file" },
      ],
    },
  ],
};
