import { RepositoryRegistry } from "./repo/Repository";

export default class ParseJob {

    registry: RepositoryRegistry
    intervalId?: NodeJS.Timeout

    constructor(registry: RepositoryRegistry) {
        this.registry = registry
    }
    
    start(url: string, baseHash: string, interval: number): void {
        const fallback = this.registry.getFallback(url)
        let repo = this.registry.getRepository(url)
        let errorCount = 0
        let currentHash = baseHash
        let first = true

        const job = async () => {
            try {
                const hash = await repo.getLatestCommit()
                if (currentHash !== hash || first) {
                    console.log(`~~~ New commit hash detected: ${hash} ~~~`)

                    const compareRes = await repo.compareCommits(currentHash, hash)
                    compareRes.forEach(file => {
                        console.log('---------------------------------------------')
                        console.log(`\tFilename: ${file.filename}`)
                        console.log(`\tStatus: ${file.status}`)
                        console.log(`\tUrl: ${file.fileUrl}`)
                        console.log(`\tPrevious Filename: ${file.previousFilename || 'N/A'}`)
                        console.log('---------------------------------------------')
                    })

                    currentHash = hash
                    first = false
                }
            } catch (e) {
                ++errorCount
                console.error(`An error has occurred: ${e}.`)
                if (repo !== fallback) {
                    console.log('Retrying operation using the fallback repository...')
                    repo = fallback
                    job()
                } else if (errorCount > 3) {
                    console.log(`
                        \nUnable to obtain data from the repository: ${url}
                        \nTerminating the application...
                    `)

                    process.exit(2)
                }
            }
        }

        job()
        this.intervalId = setInterval(job, interval)
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = undefined
        }
    }

}