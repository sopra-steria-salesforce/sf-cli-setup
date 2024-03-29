import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { execute } from './helper'

export async function installCli(): Promise<void> {
  try {
    await install()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

async function install(): Promise<void> {
  if (isNpmMode()) {
    core.info('Salesforce CLI is installed locally using npm, skipping installation.')
    return await addToPath()
  }

  if (await isAlreadyInstalled()) {
    return core.info('Salesforce CLI is already installed globally, skipping installation.')
  }

  const version = core.getInput('sf-cli-version')
  await installGlobally(version || 'latest')
}

async function installGlobally(version: string): Promise<void> {
  await execute(`npm install --global @salesforce/cli@${version}`)
  core.info(`Installed Salesforce CLI globally with version '${version}'`)
}

async function addToPath(): Promise<void> {
  if (await isAlreadyAddedToPath()) {
    return core.info('Salesforce CLI is already added to path, skipping.')
  }

  var fs = require('fs')
  var dir = './node_modules/.bin/sf-cli'

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  await execute('ln -s ./node_modules/.bin/sf ./node_modules/.bin/sf-cli/sf')
  core.addPath('./node_modules/.bin/sf-cli')

  core.info('Added local npm installation of Salesforce CLI to path, `sf` is ready for use.')
}

/* -------------------------------------------------------------------------- */
/*                                   helpers                                  */
/* -------------------------------------------------------------------------- */

function isNpmMode(): Boolean {
  return core.getInput('npm-mode') == 'true'
}

async function isAlreadyInstalled(): Promise<boolean> {
  try {
    await exec.exec('npm ls --global @salesforce/cli')
    return true
  } catch (error) {
    return false
  }
}

async function isAlreadyAddedToPath(): Promise<boolean> {
  try {
    await exec.exec('sf')
    return true
  } catch (error) {
    return false
  }
}
