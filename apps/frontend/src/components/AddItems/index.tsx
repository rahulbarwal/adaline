import { AddFile } from "./AddFile";
import { AddFolder } from "./AddFolder";

export function AddItems() {
  return (
    <div className="w-full flex flex-row justify-end items-end gap-4">
      <AddFolder />
      <AddFile />
    </div>
  );
}
