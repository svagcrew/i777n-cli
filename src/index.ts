import 'source-map-support/register'

import { applyToAll } from '@/lib/apply'
import { checkAll } from '@/lib/check'
import { combine } from '@/lib/combine'
import { getConfigCore } from '@/lib/config'
import { validateEnv } from '@/lib/env'
import { fixAll } from '@/lib/fix'
import dedent from 'dedent'
import { defineCliApp, log } from 'svag-cli-utils'

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
    case 'combine': {
      await combine({
        configCore,
      })
      break
    }
    case 'apply-combine':
    case 'ac': {
      await applyToAll({
        globs: args,
        configCore,
      })
      await combine({
        configCore,
      })
      break
    }
    case 'h': {
      log.black(dedent`Commands:
        apply ...glob[] — translate files by globs
        check ...glob[] — check files by globs
        fix ...glob[] — fix files by globs
        combine — combine all in one .json file
        ac | apply-combine ...glob[] — apply and combine
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
