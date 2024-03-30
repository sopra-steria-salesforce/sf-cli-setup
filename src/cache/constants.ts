import { getInputs } from '../shared/inputs'

const version = getInputs().SF_CLI_VERSION
const platform = process.env.RUNNER_OS

export const cachePaths = ['/opt/hostedtoolcache/sf-cli/']
export const keyPrefix = `salesforce/cli@v${version}-${platform}`
export const primaryKey = `${keyPrefix}`

export enum State {
  CacheKey = 'CACHE_KEY',
  CachePrimaryKey = 'CACHE_PRIMARY_KEY',
  CachePaths = 'CACHE_PATHS'
}
