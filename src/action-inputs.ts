import * as core from '@actions/core'
import { IActionInputs } from './types'

export const getInputs = (): IActionInputs => {
  const SF_CLI_VERSION: string = core.getInput('sf-cli-version', { required: true })
  const AUTH_URL: string = core.getInput('auth-url', { required: true })
  const USERNAME = core.getInput('username', { required: true })
  const CLIENT_ID: string = core.getInput('client-id', { required: true })
  const PRIVATE_KEY: string = core.getInput('private-key', { required: true })
  const INSTANCE_URL: string = core.getInput('instance-url', { required: true })
  const ACCESS_TOKEN: string = core.getInput('access-token', { required: true })
  const ALIAS: string = core.getInput('alias:', { required: true })
  const SET_DEFAULT_DEV_HUB: string = core.getInput('set-default-dev-hub', { required: true })
  const SET_DEFAULT_ORG: string = core.getInput('set-default-org', { required: true })
  const NPM_MODE: string = core.getInput('npm-mode', { required: true })
  return {
    SF_CLI_VERSION,
    AUTH_URL,
    USERNAME,
    CLIENT_ID,
    PRIVATE_KEY,
    INSTANCE_URL,
    ACCESS_TOKEN,
    ALIAS,
    SET_DEFAULT_DEV_HUB: SET_DEFAULT_DEV_HUB == 'true',
    SET_DEFAULT_ORG: SET_DEFAULT_ORG == 'true',
    NPM_MODE: NPM_MODE == 'true'
  }
}
