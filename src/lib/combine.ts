import { ConfigCore, getConfigUnit } from '@/lib/config'
import { parseUnitFile } from '@/lib/unit'
import { fulfillDistPath } from '@/lib/utils'
import fs from 'fs/promises'
import path from 'path'
import { getDataFromFile, getPathsByGlobs, log } from 'svag-cli-utils'

export const combine = async ({ configCore }: { configCore: ConfigCore }) => {
  if (!configCore.combinedDistPath) {
    return
  }
  const { filePaths } = await getPathsByGlobs({
    globs: configCore.globs,
    baseDir: configCore.baseDir,
  })
  const result: any = {}
  for (const unitPath of filePaths) {
    const { configUnitSource } = await parseUnitFile({ unitPath })
    const { configUnit } = await getConfigUnit({
      unitPath,
      configCore,
      configUnitSource,
    })
    for (const distLang of configUnit.distLangs) {
      const distPathFulfilled = fulfillDistPath({
        distPath: configUnit.distPath,
        distLang,
      })
      const distLocaleContent = await getDataFromFile({ filePath: distPathFulfilled })
      if (!result[distLang]) {
        result[distLang] = {}
      }
      Object.assign(result[distLang], distLocaleContent)
    }
  }
  await fs.mkdir(path.dirname(configCore.combinedDistPath), { recursive: true })
  await fs.writeFile(configCore.combinedDistPath, JSON.stringify(result, null, 2) + '\n', 'utf8')
  log.green(`File ${configCore.combinedDistPath} has been updated`)
}
