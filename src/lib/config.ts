import fg from 'fast-glob'
import { zI777LangCode } from 'i777n-core/src/index'
import { z } from 'zod'
import { getDataFromFile, pathsToLikeArrayString } from './utils'
import path from 'path'

const zConfigGeneral = z.object({
  srcLang: zI777LangCode,
  distLangs: z.array(zI777LangCode),
  distPath: z.string(),
})
export const zConfigCore = zConfigGeneral.extend({
  baseDir: z.string(),
  globs: z.array(z.string()),
})
export const zConfigCoreSource = zConfigCore.partial()
export const zConfigUnit = zConfigGeneral
export const zConfigUnitSource = zConfigUnit.partial()

// type ConfigGeneral = z.infer<typeof zConfigGeneral>
export type ConfigCore = z.infer<typeof zConfigCore>
export type ConfigCoreSource = z.infer<typeof zConfigCoreSource>
export type ConfigUnit = z.infer<typeof zConfigUnit>
export type ConfigUnitSource = z.infer<typeof zConfigUnitSource>

const defaultConfigCore: ConfigCore = {
  baseDir: '.',
  globs: ['**/locale.(ts|js|yml|yaml|json)', '!**/node_modules/**', '!**/dist/**'],
  srcLang: 'en',
  distLangs: ['en'],
  distPath: './locale/$lang.json',
}

const findAllConfigsCorePaths = async ({ dirPath }: { dirPath: string }) => {
  const configCorePaths: string[] = []
  let dirPathHere = path.resolve('/', dirPath)
  for (let i = 0; i < 777; i++) {
    const maybeConfigGlob = `${dirPathHere}/i777n.config.(js|ts|yml|yaml|json)`
    const maybeConfigPath = (
      await fg([maybeConfigGlob], {
        onlyFiles: true,
        absolute: true,
      })
    )[0]
    if (maybeConfigPath) {
      configCorePaths.push(maybeConfigPath)
    }
    const parentDirPath = path.resolve(dirPathHere, '..')
    if (dirPathHere === parentDirPath) {
      return { configCorePaths }
    }
    dirPathHere = parentDirPath
  }
  return { configCorePaths }
}

export const getConfigCore = async ({ dirPath }: { dirPath: string }) => {
  const { configCorePaths } = await findAllConfigsCorePaths({ dirPath })
  if (configCorePaths.length === 0) {
    throw new Error('Config file not found')
  }
  if (configCorePaths.length > 1) {
    throw new Error(`Multiple config files found: ${pathsToLikeArrayString(configCorePaths)}`)
  }
  const configCorePath = configCorePaths[0]
  const configCoreSource = await getDataFromFile({ filePath: configCorePath })
  const configCoreSourceValidated = zConfigCoreSource.safeParse(configCoreSource)
  if (!configCoreSourceValidated.success) {
    throw new Error(`Invalid core config file: "${configCorePath}": ${configCoreSourceValidated.error.message}`)
  }
  const configCoreMerged = { ...defaultConfigCore, ...configCoreSource }
  const configCoreMergedValidated = zConfigCore.safeParse(configCoreMerged)
  if (!configCoreMergedValidated.success) {
    throw new Error(`Invalid core config file: "${configCorePath}": ${configCoreMergedValidated.error.message}`)
  }
  return { configCore: configCoreMergedValidated.data }
}

export const getConfigUnit = async ({
  unitPath,
  configCore,
  configUnitSource,
}: {
  unitPath: string
  configCore: ConfigCore
  configUnitSource: ConfigUnitSource
}) => {
  const configUnitSourceValidated = zConfigUnitSource.safeParse(configUnitSource)
  if (!configUnitSourceValidated.success) {
    throw new Error(`Invalid config in file "${unitPath}": ${configUnitSourceValidated.error.message}`)
  }
  const configUnitMerged = { ...configCore, ...configUnitSource }
  const configUnitMergedValidated = zConfigUnit.safeParse(configUnitMerged)
  if (!configUnitMergedValidated.success) {
    throw new Error(`Invalid config in file "${unitPath}": ${configUnitMergedValidated.error.message}`)
  }
  const configUnit = configUnitMergedValidated.data
  configUnit.distPath = path.resolve(path.dirname(unitPath), configUnit.distPath)
  return { configUnit }
}
