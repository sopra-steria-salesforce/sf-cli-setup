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
  if (core.getInput('sf-cli-version')) {
    await npmInstall()
  } else {
    await installNewest()
  }
  await execute('./tmp/sf/bin/sf --version && ./tmp/sf/bin/sf plugins --core')
}

async function npmInstall(): Promise<void> {
  const version = core.getInput('sf-cli-version')
  if (!version) {
    core.setFailed(`missing version number`)
  }
  await execute(`npm install -g sfdx-cli@${version}`)
}

async function installNewest(): Promise<void> {
  const URL = 'https://developer.salesforce.com/media/salesforce-cli/sf/channels/stable/sf-linux-x64.tar.xz'
  await execute(`wget ${URL} -q -O ./tmp/sf-linux-x64.tar.xz`)
  await execute('tar xJf ./tmp/sf-linux-x64.tar.xz -C ./tmp/sf --strip-components 1')
  await execute('echo "./tmp/sf/bin" >> $GITHUB_PATH')
}
