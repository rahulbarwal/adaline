import { ItemType } from "@adaline/shared-types";
import { createContext, useContext, useRef, useState } from "react";

interface DragAndDropContextType {
  draggedItem: React.MutableRefObject<ItemType | null>;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

const DragAndDropContext = createContext<DragAndDropContextType | null>(null);

export function DragAndDropProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const draggedItem = useRef<ItemType | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DragAndDropContext.Provider
      value={{ draggedItem, isDragging, setIsDragging }}
    >
      {children}
    </DragAndDropContext.Provider>
  );
}

export function useDragAndDrop() {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error("useDragAndDrop must be used within DragAndDropProvider");
  }
  return context;
}
