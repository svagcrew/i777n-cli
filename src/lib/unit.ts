import _ from "lodash";
import { getDataFromFile } from "./utils";

export const parseUnitFile = async ({ unitPath }: { unitPath: string }) => {
  const unitSource = await getDataFromFile({ filePath: unitPath });
  const configUnitSource = unitSource.i777n || {};
  const unitContent = _.omit(unitSource, "i777n");
  return { configUnitSource, unitContent };
};
