import { getInputs } from '../shared/inputs'

const version = getInputs().SF_CLI_VERSION
const platform = process.env.RUNNER_OS
const tool_cache_folder = '/opt/hostedtoolcache'
const tool_cache_name = 'sf-cli'

export const cachePaths = [`${tool_cache_folder}/${tool_cache_name}`]
export const keyPrefix = `salesforce/cli@v${version}-${platform}`
export const primaryKey = `${keyPrefix}`

export enum Outputs {
    READY = 'ready',
    INSTALLED_FROM = 'installed-from',
    AUTHENTICATED = 'authenticated'
}
