import ParseJob from './ParseJob'
import FallbackRepository from './repo/FallbackRepository'
import GithubRepository from './repo/GithubRepository'
import { RepositoryRegistry } from './repo/Repository'

const repoRegistry = new RepositoryRegistry(url => new FallbackRepository(url))

if (process.env.FETCHER_FORCE_FALLBACK !== 'true') {
    repoRegistry.register('github.com', (url, owner, name) => new GithubRepository(url, owner, name))
}

const args = process.argv.slice(2)
const repoUrl = args[0]
const baseHash = args[1]

if (!repoUrl || !baseHash) {
    console.error('Usage: yarn start [repository url] [base hash]')
    process.exit(1)
}

const job = new ParseJob(repoRegistry)
job.start(repoUrl, baseHash, 5000)
