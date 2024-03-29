import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { execute } from './helper'
import { getInputs } from './action-inputs'

export class Installer {
  SF_CLI_VERSION: string
  NPM_MODE: boolean

  constructor() {
    const { SF_CLI_VERSION, NPM_MODE } = getInputs()
    this.SF_CLI_VERSION = SF_CLI_VERSION
    this.NPM_MODE = NPM_MODE
  }

  async install(): Promise<void> {
    try {
      await this.installCli()
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
    }
  }

  private async installCli(): Promise<void> {
    if (this.NPM_MODE) {
      core.info('Salesforce CLI is installed locally using npm, skipping installation.')
      // return await this.addToPath()
      return
    }

    if (await this.isAlreadyInstalled()) {
      return core.info('Salesforce CLI is already installed globally, skipping installation.')
    }

    await this.installGlobally(this.SF_CLI_VERSION || 'latest')
  }

  private async installGlobally(version: string): Promise<void> {
    await execute(`npm install --global @salesforce/cli@${version}`)
    core.info(`Installed Salesforce CLI globally with version '${version}'`)
  }

  private async addToPath(): Promise<void> {
    if (await this.isAlreadyAddedToPath()) {
      return core.info('Salesforce CLI is already added to path, skipping.')
    }

    await execute('mkdir -p ./node_modules/.bin/sf-cli')
    await execute('ln -s ./node_modules/.bin/sf ./node_modules/.bin/sf-cli/sf')
    core.addPath('./node_modules/.bin/sf-cli')
    core.info('Added local npm installation of Salesforce CLI to path, `sf` is ready for use.')
  }

  /* -------------------------------------------------------------------------- */
  /*                                   helpers                                  */
  /* -------------------------------------------------------------------------- */

  private async isAlreadyInstalled(): Promise<boolean> {
    try {
      await exec.exec('npm ls --global @salesforce/cli')
      return true
    } catch (error) {
      return false
    }
  }

  private async isAlreadyAddedToPath(): Promise<boolean> {
    try {
      await exec.exec('sf')
      return true
    } catch (error) {
      return false
    }
  }
}
