import ClassParser from './parser/ClassParser'
import ClassSectionParser from './parser/ClassSectionParser'
import { ParserRegistry } from './parser/Parser'
import ProgrammeParser from './parser/ProgrammeParser'
import PollingJob from './PollingJob'
import FallbackRepository from './repo/FallbackRepository'
import GithubRepository from './repo/GithubRepository'
import { RepositoryRegistry } from './repo/Repository'

const args = process.argv.slice(2)

if (args.length != 3) {
    console.error('Usage: yarn start [repository url] [institution] [base hash]')
    process.exit(1)
}

const repoUrl = args[0]
const institution = args[1]
const baseHash = args[2]

const repoRegistry = new RepositoryRegistry(url => new FallbackRepository(url))
if (process.env.FETCHER_FORCE_FALLBACK !== 'true') {
    repoRegistry.register('github.com', (url, owner, name) => new GithubRepository(url, owner, name))
}

const TIMETABLE_REGEX = RegExp(`^${institution}\\/programmes\\/[\\w-]+\\/[\\w-]+\\/timetable.json$`)

const parserRegistry = new ParserRegistry()
// Register order matters. It should follow a top-down model approach so the SQL statements come in the correct order
parserRegistry.register(TIMETABLE_REGEX, new ProgrammeParser())
parserRegistry.register(TIMETABLE_REGEX, new ClassParser())
parserRegistry.register(TIMETABLE_REGEX, new ClassSectionParser())

const job = new PollingJob(repoRegistry, parserRegistry)
job.start(repoUrl, baseHash, 5000, statements => {
    statements.forEach(stmt => console.log(stmt))
})