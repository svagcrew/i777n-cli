import fg from "fast-glob";
import { basename } from "path";
import yaml from "js-yaml";
import { promises as fs } from "fs";

export const getPathsByGlobs = async ({
  globs,
  baseDir,
}: {
  globs: string[];
  baseDir: string;
}): Promise<string[]> => {
  const paths = await fg(globs, {
    cwd: baseDir,
    onlyFiles: true,
    absolute: true,
  });
  return paths;
};

export const getDataFromFile = async ({ filePath }: { filePath: string }) => {
  const ext = basename(filePath).split(".").pop();
  if (ext === "js" || ext === "ts") {
    return require(filePath);
  }
  if (ext === "yml" || ext === "yaml") {
    return yaml.load(await fs.readFile(filePath, "utf8"));
  }
  if (ext === "json") {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  }
  throw new Error(`Unsupported file extension: ${ext}`);
};
