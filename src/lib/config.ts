import fg from "fast-glob";
import { getDataFromFile } from "./utils";

const defaultConfig = {
  baseDir: ".",
  globs: [
    "**/texts.(ts|js|yml|yaml|json)",
    "!**/node_modules/**",
    "!**/dist/**",
  ],
  langs: ["en"],
  defaultLang: "en",
};

const allowedConfigKeys = Object.keys(defaultConfig);

const findConfigPath = async ({ cwd }: { cwd: string }) => {
  const configPaths = await fg(["i777n.config.(js|ts|yml|yaml|json)"], {
    cwd,
    onlyFiles: true,
    absolute: true,
  });
  if (configPaths.length > 1) {
    throw new Error(
      `Found more than one config file: ${configPaths
        .map((p) => `"${p}"`)
        .join(", ")}`
    );
  }
  return configPaths[0] || null;
};

const getMegedConfigData = async ({ configPath }: { configPath: string }) => {
  const configData = await getDataFromFile({ filePath: configPath });
  const suitableConfigData = Object.fromEntries(
    Object.entries(configData).filter(([key]) =>
      allowedConfigKeys.includes(key)
    )
  );
  const mergedConfigData = { ...defaultConfig, ...suitableConfigData };
  return mergedConfigData;
};

export const getConfig = async () => {
  const cwd = process.cwd();
  const configPath = await findConfigPath({ cwd });
  if (!configPath) {
    return { config: defaultConfig };
  }
  const mergedConfig = await getMegedConfigData({ configPath });
  return { config: mergedConfig };
};
