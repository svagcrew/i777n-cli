import { promises as fs } from 'fs'
import { translate } from 'i777n-core'
import path from 'path'
import { getPathsByGlobs, log, stringsToLikeArrayString } from 'svag-cli-utils'
import { ConfigCore, getConfigUnit } from './config'
import { getUnitMeta, parseUnitFile, saveUnitMeta } from './unit'
import { fulfillDistPath } from './utils'

export const applyToAll = async ({ globs, configCore }: { globs?: ConfigCore['globs']; configCore: ConfigCore }) => {
  globs = !globs || !globs.length ? configCore.globs : globs
  const { filePaths } = await getPathsByGlobs({
    globs,
    baseDir: configCore.baseDir,
  })
  if (!filePaths.length) {
    throw new Error(`No files found by globs ${stringsToLikeArrayString(globs)} inside "${configCore.baseDir}"`)
  }
  for (const unitPath of filePaths) {
    await applyToOne({ unitPath, configCore })
  }
}

const applyToOne = async ({ unitPath, configCore }: { unitPath: string; configCore: ConfigCore }) => {
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
    await fs.mkdir(path.dirname(distPathFulfilled), { recursive: true })
    if (distLang === configUnit.srcLang) {
      await fs.writeFile(distPathFulfilled, JSON.stringify(unitContent, null, 2), 'utf8')
      log.black(`File ${distPathFulfilled} has been updated`)
    } else {
      const {
        content: distContent,
        meta: updatedUnitMeta,
        wasTranslated,
      } = await translate({
        content: unitContent,
        meta: unitMeta,
        srcLang: configUnit.srcLang,
        distLang,
      })
      if (wasTranslated) {
        log.green(`File ${unitPath} has been translated from ${configUnit.srcLang} to ${distLang}`)
      } else {
        log.black(`File ${unitPath} has not been translated from ${configUnit.srcLang} to ${distLang}`)
      }
      Object.assign(unitMeta, updatedUnitMeta)
      await fs.writeFile(distPathFulfilled, JSON.stringify(distContent, null, 2), 'utf8')
      log.black(`File ${distPathFulfilled} has been updated`)
    }
  }
  await saveUnitMeta({ unitMeta, unitMetaPath })
  log.black(`File ${unitMetaPath} has been updated`)
}
