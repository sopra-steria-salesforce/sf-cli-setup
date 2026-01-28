import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { cachePaths, primaryKey } from './constants.js'

export const getCachedSfCli = async (): Promise<string | void> => {
  core.info(`Checking for SF CLI with version ${primaryKey} in GitHub cache...`)

  const cacheKey = await cache.restoreCache(cachePaths, primaryKey)

  if (cacheKey) {
    core.info(`Cache restored (key: ${cacheKey})`)
    // Return the path where cache was restored (includes version in the path)
    return `${cachePaths[0]}/${primaryKey.split('@')[1]}/x64`
  }

  core.info('Cache not found, will download from npm.')
  return undefined
}
