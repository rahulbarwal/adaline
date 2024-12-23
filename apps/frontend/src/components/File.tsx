import { FileType } from "@adaline/shared-types";

export function File({ id, title, icon, order }: FileType) {
  return <div>{title}</div>;
}
