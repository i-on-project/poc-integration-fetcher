import { Repository, RepositoryFile } from "./Repository";

export default class FallbackRepository implements Repository {
    
    url: string

    constructor(url: string) {
        this.url = url
    }

    updateData(): FallbackRepository {
        throw new Error("Method not implemented.");
    }

    getLatestCommit(): Promise<string> {
        throw new Error("Method not implemented.");
    }

    compareCommits(baseSha: string, headSha: string): Promise<RepositoryFile[]> {
        throw new Error("Method not implemented.");
    }

}