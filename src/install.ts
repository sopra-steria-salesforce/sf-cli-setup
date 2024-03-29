import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import * as path from 'path'

import { execute } from './helper'
import { getInputs } from './action-inputs'
import { Action } from './types'

export class SalesforceCLI {
  SF_CLI_VERSION: string
  NPM_MODE: boolean

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

  private getHomeDir(): string {
    let homedir = ''

    if (process.platform === 'win32') {
      homedir = process.env['USERPROFILE'] || 'C:\\'
    } else {
      homedir = `${process.env.HOME}`
    }

    core.debug(`homeDir: ${homedir}`)

    return homedir
  }

  private async createWorkDir(): Promise<string> {
    const workDir = path.join(this.getHomeDir(), Action.WorkDirName)
    await io.mkdirP(workDir)
    core.debug(`workDir: ${workDir}`)
    return workDir
  }

  private async createTempDir(workDir: string): Promise<string> {
    const tempDir = path.join(workDir, Action.TempDirName)
    await io.mkdirP(tempDir)
    core.debug(`tempDir: ${tempDir}`)
    return tempDir
  }

  private async createBinDir(workDir: string): Promise<string> {
    const binDir = path.join(workDir, 'bin')
    await io.mkdirP(binDir)
    core.addPath(binDir)
    core.debug(`binDir: ${binDir}`)
    return binDir
  }

  private async download(): Promise<void> {
    const workDir = await this.createWorkDir()
    const binDir = await this.createBinDir(workDir)
    const tempDir = await this.createTempDir(workDir)

    const cliPath = await tc.downloadTool('https://registry.npmjs.org/@salesforce/cli/-/cli-2.34.7.tgz')
    await execute(`chmod +x ${tempDir}/sf/bin/run.js`)
    const cliExtractedFolder = await tc.extractTar(cliPath, tempDir)

    if (process.platform === 'win32') {
    } else {
    }
    const toolBin = `${cliExtractedFolder}/sf`

    await execute(`ln -s ${tempDir}/sf/bin/run.js ${binDir}/sf`)
    await execute(`chmod +x ${binDir}/sf`)

    // await io.mv(toolBin, binDir)
  }

  private async installCli(): Promise<void> {
    if (this.NPM_MODE) {
      core.info('Salesforce CLI is installed locally using npm, skipping installation.')
      return await this.addToPath()
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
