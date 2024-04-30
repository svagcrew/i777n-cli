import 'source-map-support/register'

import dedent from 'dedent'
import { defineCliApp, log } from 'svag-cli-utils'
import { applyToAll } from '@/lib/apply'
import { getConfigCore } from '@/lib/config'
import { validateEnv } from '@/lib/env'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineCliApp(async ({ cwd, command, args, argr, flags }) => {
  validateEnv()
  const { configCore } = await getConfigCore({
    dirPath: cwd,
  })

  switch (command) {
    case 'apply':
      await applyToAll({
        globs: args.map((arg) => arg.toString()),
        configCore,
      })
      break
    case 'h': {
      log.black(dedent`Commands:
        apply glob1 glob2 globN — translate files by globs
        h — help
        `)
      break
    }
    default: {
      log.red('Unknown command:', command)
      break
    }
  }
})
