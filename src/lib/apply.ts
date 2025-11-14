import type { ConfigCore } from '@/lib/config.js'
import { getConfigUnit } from '@/lib/config.js'
import { getUnitMeta, parseUnitFile, saveUnitMeta } from '@/lib/unit.js'
import { fulfillDistPath, normalizeGlobs } from '@/lib/utils.js'
import { promises as fs } from 'fs'
import { translate } from 'i777n-core'
import path from 'path'
import { getPathsByGlobs, log, stringsToLikeArrayString } from 'svag-cli-utils'

export const applyToAll = async ({ globs, configCore }: { globs?: ConfigCore['globs']; configCore: ConfigCore }) => {
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
  await Promise.all(
    configUnit.distLangs.map(async (distLang) => {
      try {
        // for (const distLang of configUnit.distLangs) {
        const distPathFulfilled = fulfillDistPath({
          distPath: configUnit.distPath,
          distLang,
        })
        await fs.mkdir(path.dirname(distPathFulfilled), { recursive: true })
        if (distLang === configUnit.srcLang) {
          await fs.writeFile(distPathFulfilled, JSON.stringify(unitContent, null, 2) + '\n', 'utf8')
          // log.black(`File ${distPathFulfilled} has been updated`)
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
            // log.black(`File ${unitPath} has not been translated from ${configUnit.srcLang} to ${distLang}`)
          }
          Object.assign(unitMeta, updatedUnitMeta)
          await fs.writeFile(distPathFulfilled, JSON.stringify(distContent, null, 2) + '\n', 'utf8')
          // log.black(`File ${distPathFulfilled} has been updated`)
        }
      } catch (error) {
        log.red(`Error applying to file ${unitPath} to ${distLang}: ${error}`)
      }
      // }
    })
  )
  await saveUnitMeta({ unitMeta, unitMetaPath })
  // log.black(`File ${unitMetaPath} has been updated`)
}
