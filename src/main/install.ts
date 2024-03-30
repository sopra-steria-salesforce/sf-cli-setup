// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMP'] || ''

if (!tempDirectory) {
  let baseLocation
  if (process.platform === 'win32') {
    // On windows use the USERPROFILE env variable
    baseLocation = process.env['USERPROFILE'] || 'C:\\'
  } else {
    if (process.platform === 'darwin') {
      baseLocation = '/Users'
    } else {
      baseLocation = '/home'
    }
  }
  tempDirectory = path.join(baseLocation, 'actions', 'temp')
}

/* eslint-disable import/first */
import * as path from 'path'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import { execute } from './helper'
import { getInputs } from '../shared/inputs'
import { restoreCache } from '../cache/restore'
import { IActionInputs } from '../shared/types'
/* eslint-enable import/first */

export class SalesforceCLI {
  input: IActionInputs

  constructor() {
    this.input = getInputs()

    if (!this.input.SF_CLI_VERSION) {
      // TODO: fix
    }
  }

  async install(): Promise<void> {
    try {
      if (this.input.SF_CLI_VERSION) {
        await this.installCli()
      }
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
    }
  }

  private async installCli(): Promise<void> {
    const tmp = path.join(tempDirectory, 'sf')
    await io.mkdirP(tmp)

    // Check if sf cli is already installed (would be from the same job)
    let toolPath: string = tc.find('sf-cli', this.input.SF_CLI_VERSION)

    if (!toolPath && this.input.RESTORE_CACHE) {
      // Restore the sf cli from GitHub cache (faster than npm install)
      await restoreCache()
      toolPath = tc.find('sf-cli', this.input.SF_CLI_VERSION)
    }

    if (!toolPath) {
      // Install the sf cli via npm if tool-cache and cache restore failed/empty
      await execute(`npm --global --prefix ${tmp} install @salesforce/cli@${this.input.SF_CLI_VERSION}`)
      toolPath = await tc.cacheDir(tmp, 'sf-cli', this.input.SF_CLI_VERSION)
    }

    core.addPath(`${toolPath}/bin`)
  }
}
