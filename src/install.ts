// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMP'] || ''

import * as path from 'path'

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

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import io = require('@actions/io')

import { execute } from './helper'
import { getInputs } from './action-inputs'
import { Action } from './types'

export class SalesforceCLI {
  SF_CLI_VERSION: string

  constructor() {
    this.SF_CLI_VERSION = getInputs().SF_CLI_VERSION
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
    const p = path.join(tempDirectory, 'sf')
    await io.mkdirP(p)

    let toolPath: string
    toolPath = tc.find('sf-cli', '2.34.7', 'x64')

    if (!toolPath) {
      await execute(`npm --global --prefix ${p} install @salesforce/cli@2.34.7`)
      await execute('ls')
      await execute(`ls ${p}`)
      await execute(`ls ${p}/bin`)
      toolPath = await tc.cacheDir(p, 'sf-cli', '2.34.7', 'x64')
    }

    core.addPath(`${toolPath}/bin`)
  }
}
