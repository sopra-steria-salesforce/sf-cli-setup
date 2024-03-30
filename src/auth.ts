import * as core from '@actions/core'
import { execute } from './helper'
import fs from 'fs'
import { getInputs } from './action-inputs'
import { IActionInputs } from './types'

export class SalesforceAuth {
  in: IActionInputs

  constructor() {
    this.in = getInputs()
  }

  async auth(): Promise<void> {
    try {
      this.authenticate()
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
    }
  }

  private authenticate(): void {
    if (this.in.AUTH_URL) {
      this.authenticateAuthUrl()
    } else if (this.in.USERNAME && this.in.CLIENT_ID && this.in.PRIVATE_KEY) {
      this.authenticateJwt()
    } else if (this.in.ACCESS_TOKEN && this.in.INSTANCE_URL) {
      this.authenticateAccessToken()
    }
  }

  private async authenticateAuthUrl(): Promise<void> {
    fs.writeFileSync('/tmp/sfdx_auth.txt', this.in.AUTH_URL)
    await this.auth2('sf org login sfdx-url', ['--sfdx-url-file /tmp/sfdx_auth.txt'])
    await execute('rm -rf /tmp/sfdx_auth.txt')
  }

  private async authenticateJwt(): Promise<void> {
    // need to write the key to a file, because when creating scratch orgs the private key is needed again.
    // stored in /tmp at root, which is not tracked by git. Repo is stored at /home/runner/work/my-repo-name/my-repo-name.
    fs.writeFileSync('/tmp/server.key', this.in.PRIVATE_KEY)

    await this.auth2('sf org login jwt', [
      `--username ${this.in.USERNAME}`,
      `--client-id ${this.in.CLIENT_ID}`,
      '--jwt-key-file /tmp/server.key'
    ])
  }

  private async authenticateAccessToken(): Promise<void> {
    await this.auth2(`echo ${this.in.ACCESS_TOKEN} | sf org login access-token`, ['--no-prompt'])
  }

  private async auth2(type: string, parameters: string[]): Promise<void> {
    await execute(
      `${type} ${parameters.join(' ')} ${this.alias} ${this.defaultDevhub} ${this.defaultOrg} ${this.instanceUrl}`
    )
  }

  get alias(): string {
    return this.in.ALIAS ? `--alias ${this.in.ALIAS}` : ''
  }
  get defaultDevhub(): string {
    return this.in.SET_DEFAULT_DEV_HUB ? '--set-default-dev-hub' : ''
  }
  get defaultOrg(): string {
    return this.in.SET_DEFAULT_ORG ? '--set-default' : ''
  }
  get instanceUrl(): string {
    return this.in.INSTANCE_URL ? `--instance-url ${this.in.INSTANCE_URL}` : ''
  }
}
