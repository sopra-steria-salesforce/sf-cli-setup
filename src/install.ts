// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMP'] || ''

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
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

import { execute } from './helper'
import { getInputs } from './action-inputs'
import { Action } from './types'

export class SalesforceCLI {
  SF_CLI_VERSION: string
  NPM_MODE: boolean
  SF_DIR: string = '/home/runner/sf'

  constructor() {
    const { SF_CLI_VERSION, NPM_MODE } = getInputs()
    this.SF_CLI_VERSION = SF_CLI_VERSION
    this.NPM_MODE = NPM_MODE
  }

  async install(): Promise<void> {
    try {
      await this.download()
      // await this.installCli()
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
    }
  }

  private async download(): Promise<void> {
    let toolPath: string
    toolPath = tc.find('sf-cli', '2.34.7')

    if (!toolPath) {
      const cliPath = await tc.downloadTool('https://registry.npmjs.org/@salesforce/cli/-/cli-2.34.7.tgz')

      await execute(`npm install ${cliPath} --omit dev --ignore-scripts`)
      await execute('ls')
      toolPath = await tc.cacheDir(`node_modules`, 'sf-cli', '2.34.7')
    }

    core.addPath(`${toolPath}/.bin`)
  }

  // private async installCli(): Promise<void> {
  //   if (this.NPM_MODE) {
  //     core.info('Salesforce CLI is installed locally using npm, skipping installation.')
  //     return await this.addToPath()
  //   }

  //   if (await this.isAlreadyInstalled()) {
  //     return core.info('Salesforce CLI is already installed globally, skipping installation.')
  //   }

  //   await this.installGlobally(this.SF_CLI_VERSION || 'latest')
  // }

  // private async installGlobally(version: string): Promise<void> {
  //   await execute(`npm install --global @salesforce/cli@${version}`)
  //   core.info(`Installed Salesforce CLI globally with version '${version}'`)
  // }

  // private async addToPath(): Promise<void> {
  //   if (await this.isAlreadyAddedToPath()) {
  //     return core.info('Salesforce CLI is already added to path, skipping.')
  //   }

  //   core.addPath('./node_modules/.bin/sf-cli')
  //   core.info('Added local npm installation of Salesforce CLI to path, `sf` is ready for use.')
  // }

  // /* -------------------------------------------------------------------------- */
  // /*                                   helpers                                  */
  // /* -------------------------------------------------------------------------- */

  // private async isAlreadyInstalled(): Promise<boolean> {
  //   try {
  //     await exec.exec('npm ls --global @salesforce/cli')
  //     return true
  //   } catch (error) {
  //     return false
  //   }
  // }

  // private async isAlreadyAddedToPath(): Promise<boolean> {
  //   try {
  //     await exec.exec('sf')
  //     return true
  //   } catch (error) {
  //     return false
  //   }
  // }
}
