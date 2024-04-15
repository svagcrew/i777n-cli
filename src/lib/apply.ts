import { promises as fs } from 'fs'
import path from 'path'
import { ConfigCore, getConfigUnit } from './config'
import { parseUnitFile } from './unit'
import { fulfillDistPath, getPathsByGlobs, pathsToLikeArrayString } from './utils'

export const applyToAll = async ({ globs, configCore }: { globs?: ConfigCore['globs']; configCore: ConfigCore }) => {
  globs = !globs || !globs.length ? configCore.globs : globs
  const { filePaths } = await getPathsByGlobs({
    globs,
    baseDir: configCore.baseDir,
  })
  if (!filePaths.length) {
    throw new Error(`No files found by globs ${pathsToLikeArrayString(globs)} inside "${configCore.baseDir}"`)
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
  console.info('Applying', unitPath, configUnit, unitContent)
  for (const distLang of configUnit.distLangs) {
    const distPathFulfilled = fulfillDistPath({
      distPath: configUnit.distPath,
      distLang,
    })
    const contentTranslated = unitContent
    await fs.mkdir(path.dirname(distPathFulfilled), { recursive: true })
    await fs.writeFile(distPathFulfilled, JSON.stringify(contentTranslated, null, 2), 'utf8')
    console.log(`File ${distPathFulfilled} has been created`)
  }
}
