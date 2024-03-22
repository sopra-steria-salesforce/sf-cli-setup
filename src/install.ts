import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { execute } from './helper'

export async function installCli(): Promise<void> {
  try {
    if (await isAlreadyInstalled()) {
      core.info('Salesforce CLI is already installed, skipping installation.')
      return
    }

    await install()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

async function install(): Promise<void> {
  const version = core.getInput('sf-cli-version')
  if (version) {
    await execute(`npm install --global @salesforce/cli@${version}`)
  } else {
    await execute(`npm install --global @salesforce/cli@latest`)
  }
  await execute('sf --version && sf plugins --core')
}

async function isAlreadyInstalled(): Promise<boolean> {
  try {
    await exec.exec('npm ls --global @salesforce/cli')
    return true
  } catch (error) {
    return false
  }
}
