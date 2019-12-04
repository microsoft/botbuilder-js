import { FileResource } from "./fileResource";
import { normalize, extname } from "path";
import { readdirSync } from "fs";
import { IResource } from "./resource";
import { IResourceProvider } from "./resourceProvider";
import { PathUtil } from "../pathUtil";

export class FolderResourceProvider implements IResourceProvider {
    private extensions: Set<string> = new Set<string>();

    private resources: Map<string, FileResource> = new Map<string, FileResource>();

    public IncludeSubFolders: boolean;

    public Directory: string;

    constructor(folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true) {

        const extensionsToInclude: string[] = [".lg", ".qna", ".lu", ".dialog", ".schema", ".md"];

        extensionsToInclude.forEach(e => this.extensions.add(e));

        this.IncludeSubFolders = includeSubFolders;
        folder = normalize(folder);
        this.Directory = folder;
        const allFiles: string[] = PathUtil.GetAllFiles(folder);
        const allFilteredFiles: string[] = allFiles.filter(f => this.extensions.has(extname(f)));

        allFilteredFiles.forEach(f => {
            const fileResource: FileResource = new FileResource(f);
            this.resources[fileResource.id()] = fileResource;
        });

        if (monitorChanges) {
            // todo monitor changes
        }
    }

    public async getResource(id: string): Promise<IResource> {
        if (this.resources.has(id)) {
            return this.resources[id];
        }

        return null;
    }

    public async getResources(extension: string): Promise<IResource[]> {
        extension = `.${extension.toLowerCase()}`;

        let filteredResources: IResource[] = [];

        for (let key in this.resources) {
            if (key.toLowerCase().endsWith(extension)) {
                filteredResources.push(this.resources[key]);
            }
        }

        return filteredResources;
    }

    public id(): string {
        return this.Directory;
    }
}