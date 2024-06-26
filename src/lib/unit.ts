import type { ConfigUnit } from '@/lib/config.js'
import { fulfillDistPath } from '@/lib/utils.js'
import fs from 'fs/promises'
import type { I777Meta } from 'i777n-core'
import { getClearI777Meta, normalizeI777Meta } from 'i777n-core'
import _ from 'lodash'
import { getDataFromFile, isFileExists } from 'svag-cli-utils'

export const parseUnitFile = async ({ unitPath }: { unitPath: string }) => {
  const unitSource = (await getDataFromFile({ filePath: unitPath })) as Record<string, any>
  const configUnitSource = unitSource.i777n || {}
  const unitContent = _.omit(unitSource, 'i777n')
  return { configUnitSource, unitContent, unitSource }
}

export const getUnitMeta = async ({
  configUnit,
  unitContent,
}: {
  configUnit: ConfigUnit
  unitContent: Record<string, any>
}) => {
  const unitMetaPath = fulfillDistPath({
    distPath: configUnit.distPath,
    distLang: '_',
  })
  const { fileExists: unitMetaExists } = await isFileExists({ filePath: unitMetaPath })
  if (!unitMetaExists) {
    const { meta: unitMetaClear } = getClearI777Meta({
      distLangs: configUnit.distLangs,
      srcLang: configUnit.srcLang,
      content: unitContent,
    })
    return { unitMeta: unitMetaClear, unitMetaPath }
  }
  const unitMetaSource = (await getDataFromFile({ filePath: unitMetaPath })) as I777Meta
  const { meta: unitMetaNormailzed } = normalizeI777Meta({
    metaSource: unitMetaSource,
    distLangs: configUnit.distLangs,
    srcLang: configUnit.srcLang,
    content: unitContent,
  })
  return {
    unitMeta: unitMetaNormailzed,
    unitMetaPath,
  }
}

export const saveUnitMeta = async ({ unitMeta, unitMetaPath }: { unitMeta: I777Meta; unitMetaPath: string }) => {
  await fs.writeFile(unitMetaPath, JSON.stringify(unitMeta, null, 2) + '\n', 'utf8')
}
