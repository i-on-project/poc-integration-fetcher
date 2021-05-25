import { ParserRegistry } from "./parser/Parser";
import { Repository, RepositoryFile, RepositoryRegistry } from "./repo/Repository";

type Job = (jobRepo: Repository) => Promise<RepositoryFile[] | undefined>
type PollingEvent = (sqlStatements: string[]) => void

export default class PollingJob {

    repoRegistry: RepositoryRegistry
    parserRegistry: ParserRegistry
    intervalId?: NodeJS.Timeout
    _currentJob?: Promise<RepositoryFile[] | undefined>
    _started = false

    constructor(repoRegistry: RepositoryRegistry, parserRegistry: ParserRegistry) {
        this.repoRegistry = repoRegistry
        this.parserRegistry = parserRegistry
    }
    
    start(url: string, baseHash: string, interval: number, onPollingEvent: PollingEvent): void {
        if (this._started) {
            return
        }

        this._started = true

        const fallback = this.repoRegistry.getFallback(url)
        const repo = this.repoRegistry.getRepository(url)
        const job = this._createJob(baseHash, fallback)

        this._doJob(job, repo, onPollingEvent)
        this.intervalId = setInterval(() => this._doJob(job, repo, onPollingEvent), interval)
    }

    _createJob(baseHash: string, fallback: Repository): Job {
        let currentHash = baseHash
        const job = async (jobRepo: Repository): Promise<RepositoryFile[] | undefined> => {
            try {
                const hash = await jobRepo.getLatestCommit()
                if (currentHash !== hash) {
                    console.log(`~~~ New commit hash detected: ${hash} ~~~`)
                    const compareRes = await jobRepo.compareCommits(currentHash, hash)
                    currentHash = hash
                    return compareRes
                }
            } catch (e) {
                console.error(`An error has occurred: ${e}.`)
                if (jobRepo !== fallback) {
                    console.log('Retrying operation using the fallback repository...')
                    return await job(fallback)
                } else {
                    throw e
                }
            }
        }

        return job
    }

    async _doJob(job: Job, jobRepo: Repository, onPollingEvent: PollingEvent): Promise<void> {
        try {
            if (!this._currentJob) {
                this._currentJob = job(jobRepo)
                const data = await this._currentJob
                if (data) {
                    const sql = data.flatMap(file => this.parserRegistry.generateSqlStatements(file))
                    onPollingEvent(sql)
                }

                this._currentJob = undefined
            }
        } catch (e) {
            console.error(`Error while processing job: ${e}`)

            this._currentJob = undefined
            await this.stop()
        }
    }

    async stop(): Promise<void> {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = undefined
        }

        if (this._currentJob) {
            await this._currentJob
            this._currentJob = undefined
        }
    }

}