export const fulfillDistPath = ({ distPath, distLang }: { distPath: string; distLang: string }) => {
  return distPath.replace(/\$lang/g, distLang)
}
