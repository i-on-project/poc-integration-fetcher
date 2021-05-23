export type RepositoryFileStatus = 'added' | 'modified' | 'removed' | 'renamed'

export interface RepositoryFile {
    filename: string
    previousFilename?: string
    status: RepositoryFileStatus
    fileUrl: string
}

export interface Repository {

    updateData(): Repository

    getLatestCommit(): Promise<string>

    compareCommits(baseSha: string, headSha: string): Promise<RepositoryFile[]>

}

type FallbackRepositorySupplier = (repoUrl: string) => Repository
type RepositorySupplier = (repoUrl: string, repoOwner: string, repoName: string) => Repository

export class RepositoryRegistry {
    
    fallbackRepo: FallbackRepositorySupplier;
    registry = new Map<RegExp, RepositorySupplier>();

    constructor(fallbackRepo: FallbackRepositorySupplier) {
        this.fallbackRepo = fallbackRepo
    }

    register(hostname: string, supplier: RepositorySupplier): void {
        const regex = new RegExp(`^https?:\\/\\/(?:www.)?${hostname}\\/([\\w-]+)\\/([\\w-]+)(?:.git)?$`)
        this.registry.set(regex, supplier)
    }

    getRepository(url: string): Repository {
        for (const pair of this.registry) {
            const regex = pair[0]
            const supplier = pair[1]

            const groups = regex.exec(url)
            if (groups) {
                const owner = groups[1]
                const name = groups[2]
                return supplier(url, owner, name)
            }
        }

        return this.fallbackRepo(url)
    }

    getFallback(url: string): Repository {
        return this.fallbackRepo(url)
    }

}