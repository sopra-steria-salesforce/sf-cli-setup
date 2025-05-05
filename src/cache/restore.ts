import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { cachePaths, primaryKey } from './constants.js'

export const restoreCache = async (): Promise<void> => {
  core.info(`Checking cache with primary key '${primaryKey}`)
  const cacheKey = await cache.restoreCache(cachePaths, primaryKey)
  core.info(
    cacheKey
      ? `Cache restored (key: ${cacheKey})`
      : 'Cache not found, will download from npm.'
  )
}
