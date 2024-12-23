import "./App.css";
import { AddItems } from "./components/AddItems";
import { ReorderArea } from "./components/ReorderArea";
import { AppStateProvider } from "./context/AppStateContext";

function App() {
  return (
    <AppStateProvider>
      <div className="w-full h-full m-auto max-w-screen-lg p-8 flex flex-col gap-8">
        <AddItems />
        <ReorderArea />
      </div>
    </AppStateProvider>
  );
}

export default App;
