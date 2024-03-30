// Load tempDirectory before it gets wiped by tool-cache
let tempDirectory = process.env['RUNNER_TEMP'] || ''

if (!tempDirectory) {
    let baseLocation
    if (process.platform === 'win32') {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\'
    } else {
        if (process.platform === 'darwin') {
            baseLocation = '/Users'
        } else {
            baseLocation = '/home'
        }
    }
    tempDirectory = path.join(baseLocation, 'actions', 'temp')
}

/* eslint-disable import/first */
import * as path from 'path'
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as io from '@actions/io'
import { execute } from './helper'
import { getInputs } from '../shared/inputs'
import { restoreCache } from '../cache/restore'
import { IActionInputs } from '../shared/types'
import { Outputs } from '../cache/constants'
/* eslint-enable import/first */

export class SalesforceCLI {
    input: IActionInputs

    constructor() {
        this.input = getInputs()
    }

    async install(): Promise<void> {
        try {
            await this.start()
        } catch (error) {
            if (error instanceof Error) {
                this.setOutput(false)
                core.setFailed(error.message)
            }
        }
    }

    private async start(): Promise<void> {
        if (await this.alreadyInstalled()) {
            this.setOutput(true, 'already-installed')
            return core.info('sf cli already installed and added to path, skipping')
        }

        // Check if sf cli was added to tool-cache (would be from this plugin being ran twice in the same job)
        let toolPath: string = tc.find('sf-cli', this.input.SF_CLI_VERSION)
        if (toolPath) {
            core.info('The sf cli was found in the tool-cache, adding to path...')
            this.setOutput(true, 'tool-cache')
        }

        // Restore the sf cli from GitHub cache (faster than npm install)
        if (!toolPath && this.input.USE_CACHE) {
            core.info(`Checking for sf cli with version ${this.input.SF_CLI_VERSION} in GitHub cache...`)
            await restoreCache()
            toolPath = tc.find('sf-cli', this.input.SF_CLI_VERSION)

            if (toolPath) {
                this.setOutput(true, 'cache')
            }
        }

        // Install the sf cli via npm if tool-cache and cache restore failed/empty
        if (!toolPath) {
            core.info(`Installing sf cli (version ${this.input.SF_CLI_VERSION}) from npm...`)
            const tmp = path.join(tempDirectory, 'sf')
            await io.mkdirP(tmp)
            await execute(`npm --global --prefix ${tmp} install @salesforce/cli@${this.input.SF_CLI_VERSION}`)
            toolPath = await tc.cacheDir(tmp, 'sf-cli', this.input.SF_CLI_VERSION)
            this.setOutput(true, 'npm')
        }

        // Make sf command available to path and in other steps
        core.info('Adding sf cli to path...')
        core.addPath(`${toolPath}/bin`)
        core.info('✅ Success! sf commands no available in your workflow.')
    }

    private setOutput(ready: boolean, source?: string): void {
        core.setOutput(Outputs.READY, ready)
        if (source) core.setOutput(Outputs.INSTALLED_FROM, source)
    }

    private async alreadyInstalled(): Promise<boolean> {
        try {
            await execute('sf --version')
            return true
        } catch (error) {
            return false
        }
    }
}
