import { FileType } from "@adaline/shared-types";

interface FileProps extends FileType {}
export function File({ id, title, icon, order }: FileProps) {
  return (
    <div className={`flex flex-row gap-2 items-center ml-$`}>
      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
      <div className="text-sm text-blue-800">{title}</div>
    </div>
  );
}
