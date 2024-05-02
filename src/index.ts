import 'source-map-support/register'

import { applyToAll } from '@/lib/apply'
import { getConfigCore } from '@/lib/config'
import { validateEnv } from '@/lib/env'
import dedent from 'dedent'
import { defineCliApp, log } from 'svag-cli-utils'
import { checkAll } from '@/lib/check'
import { fixAll } from '@/lib/fix'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
defineCliApp(async ({ cwd, command, args, argr, flags }) => {
  validateEnv()
  const { configCore } = await getConfigCore({
    dirPath: cwd,
  })

  switch (command) {
    case 'apply': {
      await applyToAll({
        globs: args,
        configCore,
      })
      break
    }
    case 'check': {
      await checkAll({
        globs: args,
        configCore,
      })
      break
    }
    case 'fix': {
      await fixAll({
        globs: args,
        configCore,
      })
      break
    }
    case 'h': {
      log.black(dedent`Commands:
        apply ...glob[] — translate files by globs
        check ...glob[] — check files by globs
        fix ...glob[] — fix files by globs
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
