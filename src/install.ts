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
  const version = core.getInput('sf-cli-version', { required: true })
  if (!version) {
    core.setFailed(`missing version number, provide 'sf-cli-version' with 'latest' or a specific version number`)
  }
  await execute(`npm install -g @salesforce/cli@${version}`)
  await execute('sf --version && sf plugins --core')
}
