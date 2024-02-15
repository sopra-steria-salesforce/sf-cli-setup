import * as core from '@actions/core'
import { execute } from './helper'

export async function installCli(): Promise<void> {
  try {
    await init()
    await install()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

async function init(): Promise<void> {
  await execute('mkdir -p tmp')
  await execute('mkdir -p tmp/sf')
}

async function install(): Promise<void> {
  const version = core.getInput('sf-cli-version')
  if (version) {
    await execute(`npm install -g @salesforce/cli@${version}`)
  } else {
    await execute(`npm install -g @salesforce/cli@latest`)
  }
  await execute('sf --version && sf plugins --core')
}
