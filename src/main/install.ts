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
/* eslint-enable import/first */

export class SalesforceCLI {
  SF_CLI_VERSION: string

  constructor() {
    this.SF_CLI_VERSION = getInputs().SF_CLI_VERSION

    if (!this.SF_CLI_VERSION) {
    }
  }

  async install(): Promise<void> {
    try {
      if (this.SF_CLI_VERSION) {
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

    let toolPath: string = tc.find('sf-cli', this.SF_CLI_VERSION)

    if (!toolPath) {
      await restoreCache()
      toolPath = tc.find('sf-cli', this.SF_CLI_VERSION)
    }

    if (!toolPath) {
      await execute(`npm --global --prefix ${tmp} install @salesforce/cli@${this.SF_CLI_VERSION}`)
      toolPath = await tc.cacheDir(tmp, 'sf-cli', this.SF_CLI_VERSION)
    }

    core.addPath(`${toolPath}/bin`)
  }
}
