import { IResourceProvider } from "./resourceProvider";
import { ResourceResponse } from "botbuilder-core";
import { PathUtil } from "../pathUtil";
import { normalize, join, dirname } from "path";
import { readdirSync, statSync } from "fs";
import { FolderResourceProvider } from "./folderResoureProvider";
import { IResource } from "./resource";

export class ResourceExplorer {

    private _resourceProviders: IResourceProvider[] = [];

    constructor() {
    }

    get resourceProviders(): IResourceProvider[] {
        return this.resourceProviders;
    }

    public static loadProject(projectFile: string, ignoreFolders: string[], monitorChanges: boolean) {
        let explorer: ResourceExplorer = new ResourceExplorer();
        projectFile = normalize(projectFile);

        ignoreFolders = ignoreFolders.map(f => normalize(f));
        const projectFolder = dirname(projectFile);
        if (ignoreFolders) {
            explorer.addFolders(projectFolder, ignoreFolders, monitorChanges);
        }
        else {
            explorer.addResourceProvider(new FolderResourceProvider(projectFolder, true, monitorChanges));
        }

        return explorer;
    }

    public addResourceProvider(resourceProvider: IResourceProvider): ResourceExplorer {
        if (this._resourceProviders.some(r => r.id() === resourceProvider.id())) {
            throw Error(`${resourceProvider.id()} has already been added as a resource`)
        }

        this._resourceProviders.push(resourceProvider);

        return this;
    }

    public addFolders(folder: string, ignoreFolders: string[] = null, monitorChanges: boolean = true): ResourceExplorer {
        if (ignoreFolders) {
            folder = normalize(folder);
            this.addFolder(folder, false, monitorChanges);
        }

        return this;
    }

    public addFolder(folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true) {
        this.addResourceProvider(new FolderResourceProvider(folder, includeSubFolders, monitorChanges));
    }

    public async getResources(fileExtension: string): Promise<IResource[]> {
        let resources: IResource[] = [];
        for (const rp of this._resourceProviders) {
            for (const rpResources of await rp.getResources(fileExtension)) {
                resources.push(rpResources);
            }
        }

        return resources;
    }

    public async getResource(id: string): Promise<IResource> {
        for (const rp of this._resourceProviders) {
            const rpResource: IResource = await rp.getResource(id);
            if (rpResource) {
                return rpResource;
            }
        }

        return null;
    }
}