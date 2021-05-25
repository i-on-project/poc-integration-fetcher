import { RepositoryFile } from "../repo/Repository";
import { Parser } from "./Parser";

export default class ClassSectionParser implements Parser {

    generateFileAddedSql(repoFile: RepositoryFile): string[] {
        throw new Error("Method not implemented.");
    }
    
    generateFileRemovedSql(repoFile: RepositoryFile): string[] {
        throw new Error("Method not implemented.");
    }

    generateFileModifiedSql(repoFile: RepositoryFile): string[] {
        throw new Error("Method not implemented.");
    }

    generateFileRenamedSql(repoFile: RepositoryFile): string[] {
        throw new Error("Method not implemented.");
    }

}