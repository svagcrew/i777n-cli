import { promises as fs } from 'fs'
import { fix } from 'i777n-core'
import path from 'path'
import { getDataFromFile, getPathsByGlobs, log, stringsToLikeArrayString } from 'svag-cli-utils'
import { ConfigCore, getConfigUnit } from './config'
import { getUnitMeta, parseUnitFile, saveUnitMeta } from './unit'
import { fulfillDistPath, normalizeGlobs } from './utils'

export const fixAll = async ({ globs, configCore }: { globs?: ConfigCore['globs']; configCore: ConfigCore }) => {
  const { normalizedGlobs } = normalizeGlobs({ globs, configCore })
  const { filePaths } = await getPathsByGlobs({
    globs: normalizedGlobs,
    baseDir: configCore.baseDir,
  })
  if (!filePaths.length) {
    throw new Error(
      `No files found by globs ${stringsToLikeArrayString(normalizedGlobs)} inside "${configCore.baseDir}"`
    )
  }
  for (const unitPath of filePaths) {
    await fixOne({ unitPath, configCore })
  }
}

const fixOne = async ({ unitPath, configCore }: { unitPath: string; configCore: ConfigCore }) => {
  const { configUnitSource, unitContent } = await parseUnitFile({ unitPath })
  const { configUnit } = await getConfigUnit({
    unitPath,
    configCore,
    configUnitSource,
  })
  const { unitMetaPath, unitMeta } = await getUnitMeta({
    configUnit,
    unitContent,
  })
  for (const distLang of configUnit.distLangs) {
    const distPathFulfilled = fulfillDistPath({
      distPath: configUnit.distPath,
      distLang,
    })
    const distContent = await getDataFromFile({ filePath: distPathFulfilled })
    await fs.mkdir(path.dirname(distPathFulfilled), { recursive: true })
    const { meta: updatedUnitMeta } = await fix({
      srcContent: unitContent,
      distContent,
      meta: unitMeta,
      srcLang: configUnit.srcLang,
      distLang,
    })
    Object.assign(unitMeta, updatedUnitMeta)
  }
  await saveUnitMeta({ unitMeta, unitMetaPath })
  log.black(`File ${unitMetaPath} has been updated`)
}
