import type { ConfigCore } from '@/lib/config.js'
import { getConfigUnit } from '@/lib/config.js'
import { getUnitMeta, parseUnitFile } from '@/lib/unit.js'
import { normalizeGlobs } from '@/lib/utils.js'
import { check } from 'i777n-core'
import { getPathsByGlobs, log, stringsToLikeArrayString } from 'svag-cli-utils'

export const checkAll = async ({ globs, configCore }: { globs?: ConfigCore['globs']; configCore: ConfigCore }) => {
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
    await checkOne({ unitPath, configCore })
  }
}

const checkOne = async ({ unitPath, configCore }: { unitPath: string; configCore: ConfigCore }) => {
  const { configUnitSource, unitContent } = await parseUnitFile({ unitPath })
  const { configUnit } = await getConfigUnit({
    unitPath,
    configCore,
    configUnitSource,
  })
  const { unitMeta } = await getUnitMeta({
    configUnit,
    unitContent,
  })
  for (const distLang of configUnit.distLangs) {
    const result = await check({
      content: unitContent,
      meta: unitMeta,
      srcLang: configUnit.srcLang,
      distLang,
    })
    if (result.willBeTranslated) {
      log.green(`File ${unitPath} will be translated from ${configUnit.srcLang} to ${distLang}`)
    } else {
      // log.black(`File ${unitPath} will not be translated from ${configUnit.srcLang} to ${distLang}`)
    }
  }
}
