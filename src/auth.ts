import * as core from '@actions/core'
import { execute } from './helper'
import fs from 'fs'

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
  } else if (
    core.getInput('username') &&
    core.getInput('client-id') &&
    (core.getInput('private-key') || core.getInput('private-key-base64'))
  ) {
    authenticateJwt()
  } else if (core.getInput('access-token') && core.getInput('instance-url')) {
    authenticateAccessToken()
  }
}

async function authenticateAuthUrl(): Promise<void> {
  fs.writeFileSync('/tmp/sfdx_auth.txt', core.getInput('auth-url'))
  await execute('sf org login sfdx-url --sfdx-url-file /tmp/sfdx_auth.txt --set-default-dev-hub --set-default')
  await execute('rm -rf /tmp/sfdx_auth.txt')
}

async function authenticateJwt(): Promise<void> {
  const user = core.getInput('username')
  const client_id = core.getInput('client-id')
  let private_key = ''
  if (core.getInput('private-key')) {
    private_key = core.getInput('private-key')
  } else if (core.getInput('private-key-base64')) {
    const base64decoded = Buffer.from(core.getInput('private-key-base64'), 'base64')
    private_key = base64decoded.toString()
  }

  fs.writeFileSync('/tmp/server.key', private_key)
  await execute(`sf org login jwt --username ${user} --client-id ${client_id} --jwt-key-file /tmp/server.key`)
}

async function authenticateAccessToken(): Promise<void> {
  const token = core.getInput('access-token')
  const url = core.getInput('instance-url')
  await execute(
    `echo ${token} | sf org login access-token --set-default-dev-hub --set-default --no-prompt --instance-url ${url}`
  )
}
