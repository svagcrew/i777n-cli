import type { ConfigCore } from '@/lib/config.js'

export const fulfillDistPath = ({ distPath, distLang }: { distPath: string; distLang: string }) => {
  return distPath.replace(/\$lang/g, distLang)
}

export const normalizeGlobs = ({ globs, configCore }: { globs?: string[]; configCore: ConfigCore }) => {
  const normalizedGlobs = !globs?.length ? configCore.globs : globs
  return { normalizedGlobs }
}
