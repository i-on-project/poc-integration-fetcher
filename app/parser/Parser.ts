import { RepositoryFile } from "../repo/Repository"

export interface Parser {
    generateFileAddedSql(repoFile: RepositoryFile): string[]
    generateFileRemovedSql(repoFile: RepositoryFile): string[]
    generateFileModifiedSql(repoFile: RepositoryFile): string[]
    generateFileRenamedSql(repoFile: RepositoryFile): string[]
}

export class ParserRegistry {

    _parserArr: [RegExp, Parser][] = []

    register(regex: RegExp, parser: Parser): void {
        this._parserArr.push([regex, parser])
    }

    generateSqlStatements(repoFile: RepositoryFile): string[] {
        let statements: string[] = []
        for (const entry of this._parserArr) {
            if (entry[0].test(repoFile.filename)) {
                const parser = entry[1]
                switch (repoFile.status) {
                    case 'added':
                        statements = statements.concat(parser.generateFileAddedSql(repoFile))
                        break
                    case 'removed':
                        statements = statements.concat(parser.generateFileRemovedSql(repoFile))
                        break
                    case 'modified':
                        statements = statements.concat(parser.generateFileModifiedSql(repoFile))
                        break
                    case 'renamed':
                        statements = statements.concat(parser.generateFileRenamedSql(repoFile))
                        break
                }
            }
        }

        return statements
    }

}