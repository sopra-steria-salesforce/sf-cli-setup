import * as core from '@actions/core'
import { execute } from './helper'
import fs from 'fs'

const instanceUrl = core.getInput('instance-url') ? '--instance-url ' + core.getInput('instance-url') : ''
const defaultOrg = core.getInput('set-default-org') ? '--set-default' : ''
const defaultDevhub = core.getInput('set-default-dev-hub') ? '--set-default-dev-hub' : ''
const alias = core.getInput('alias') ? '--salias ' + core.getInput('alias') : ''

export async function authOrg(): Promise<void> {
  try {
    authenticate()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

function authenticate(): void {
  if (core.getInput('auth-url')) {
    authenticateAuthUrl()
  } else if (core.getInput('username') && core.getInput('client-id') && core.getInput('private-key')) {
    authenticateJwt()
  } else if (core.getInput('access-token') && core.getInput('instance-url')) {
    authenticateAccessToken()
  }
}

async function authenticateAuthUrl(): Promise<void> {
  fs.writeFileSync('/tmp/sfdx_auth.txt', core.getInput('auth-url'))
  await execute(`sf org login sfdx-url --sfdx-url-file /tmp/sfdx_auth.txt ${defaultDevhub} ${defaultOrg} ${alias}`)
  await execute('rm -rf /tmp/sfdx_auth.txt')
}

async function authenticateJwt(): Promise<void> {
  const user = core.getInput('username')
  const client_id = core.getInput('client-id')
  // need to write the key to a file, because when creating scratch orgs the private key is needed again.
  // stored in /tmp at root, which is not tracked by git. Repo is stored at /home/runner/work/my-repo-name/my-repo-name.
  fs.writeFileSync('/tmp/server.key', core.getInput('private-key'))

  await execute(
    [
      'sf org login jwt',
      '--username ' + user,
      '--client-id ' + client_id,
      '--jwt-key-file /tmp/server.key',
      instanceUrl,
      defaultDevhub,
      defaultOrg,
      alias
    ].join(' ')
  )
}

async function authenticateAccessToken(): Promise<void> {
  const token = core.getInput('access-token')
  const url = core.getInput('instance-url')

  await execute(
    `echo ${token} | sf org login access-token ${defaultDevhub} ${defaultOrg} ${alias} --no-prompt --instance-url ${url}`
  )
}
