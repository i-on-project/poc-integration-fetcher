import { Octokit } from "@octokit/core";
import { Repository, RepositoryFile, RepositoryFileStatus } from "./Repository";

const MAIN_BRANCH = 'master'

const octokit = new Octokit()

export default class GithubRepository implements Repository {
    
    url: string
    owner: string
    repo: string

    constructor(url: string, owner: string, repo: string) {
        this.url = url
        this.owner = owner
        this.repo = repo
    }

    updateData(): GithubRepository {
        // TODO: implement data cache
        return this
    }

    async getLatestCommit(): Promise<string> {
        const res = await octokit.request('GET /repos/{owner}/{repo}/branches/{branch}', {
            owner: this.owner,
            repo: this.repo,
            branch: MAIN_BRANCH
        })

        return res.data.commit.sha
    }

    async compareCommits(baseSha: string, headSha: string): Promise<RepositoryFile[]> {
        const res = await octokit.request('GET /repos/{owner}/{repo}/compare/{base}...{head}', {
            owner: this.owner,
            repo: this.repo,
            base: baseSha,
            head: headSha
        })

        const files = res.data.files || []
        return files.map(file => ({
            filename: file.filename,
            previousFilename: file.previous_filename,
            status: file.status as RepositoryFileStatus,
            fileUrl: file.raw_url
        }))
    }

}