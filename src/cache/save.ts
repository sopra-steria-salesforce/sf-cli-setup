import * as core from '@actions/core'
import * as cache from '@actions/cache'
import { State } from './constants'
import { getInputs } from '../shared/inputs'

// Catch and log any unhandled exceptions.  These exceptions can leak out of the uploadChunk method in
// @actions/toolkit when a failed upload closes the file descriptor causing any in-process reads to
// throw an uncaught exception.  Instead of failing this action, just warn.
process.on('uncaughtException', e => {
    const warningPrefix = '[warning]'
    core.info(`${warningPrefix}${e.message}`)
})

// Added early exit to resolve issue with slow post action step:
export async function run(earlyExit?: boolean): Promise<void> {
    try {
        if (!getInputs().USE_CACHE) {
            return
        }

        await cachePackages()

        if (earlyExit) {
            process.exit(0)
        }
    } catch (error) {
        core.setFailed((error as Error).message)
    }
}

const cachePackages = async (): Promise<void> => {
    const cacheKey = core.getState(State.CacheKey)
    const primaryKey = core.getState(State.CachePrimaryKey)
    const cachePaths = JSON.parse(core.getState(State.CachePaths) || '[]') as string[]

    core.debug('test')
    core.debug(core.getState(State.CachePaths))

    if (!cachePaths.length) {
        throw new Error(`Cache folder paths were not retrieved`)
    }

    if (primaryKey === cacheKey) {
        return core.info(`Cache hit occurred on the primary key ${primaryKey}, not saving cache.`)
    }

    const cacheId = await cache.saveCache(cachePaths, primaryKey)
    if (cacheId === -1) {
        return
    }

    core.info(`Cache saved with the key: ${primaryKey}`)
}

run(true)
