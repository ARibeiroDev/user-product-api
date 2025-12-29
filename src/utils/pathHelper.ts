import path from "path";
import { fileURLToPath } from "url";

export const getFileName = (metaUrl: string) => fileURLToPath(metaUrl);
export const getDirName = (metaUrl: string) =>
  path.dirname(getFileName(metaUrl));
