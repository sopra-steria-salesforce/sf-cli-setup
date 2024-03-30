import * as cache from '@actions/cache'
import * as core from '@actions/core'
import { State, cachePaths, primaryKey } from './constants'

export const restoreCache = async (): Promise<void> => {
    core.info(`Checking cache with primary key '${primaryKey}`)

    core.saveState(State.CachePaths, cachePaths)
    core.saveState(State.CachePrimaryKey, primaryKey)

    const cacheKey = await cache.restoreCache(cachePaths, primaryKey)
    core.saveState(State.CacheKey, cacheKey)
    core.info(cacheKey ? `Cache restored (key: ${cacheKey})` : 'Cache not found, will download from npm.')
}
