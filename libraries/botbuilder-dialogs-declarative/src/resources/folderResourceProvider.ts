/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { watch, FSWatcher } from 'chokidar';
import { normalize, extname } from 'path';
import { FileResource } from './fileResource';
import { Resource } from './resource';
import { ResourceProvider, ResourceChangeEvent } from './resourceProvider';
import { ResourceExplorer } from './resourceExplorer';
import { PathUtil } from '../pathUtil';

export class FolderResourceProvider extends ResourceProvider {
    private _watcher: FSWatcher;
    private _resources: Map<string, FileResource> = new Map<string, FileResource>();

    /**
     * Initializes a new instance of the `FolderResourceProvider` class
     * @param resourceExplorer Resource explorer
     * @param folder Root folder
     * @param includeSubFolders Whether include its sub folders
     * @param monitorChanges Whether monitor changes
     */
    public constructor(resourceExplorer: ResourceExplorer, folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true) {
        super(resourceExplorer);

        this.includeSubFolders = includeSubFolders;
        folder = normalize(folder);
        this.directory = folder;
        this._id = this.directory;
        this.refresh();

        if (monitorChanges) {
            this._watcher = watch(folder, { depth: includeSubFolders ? undefined : 1 });
            this._watcher
                .on('add', this.onResourceAdded.bind(this))
                .on('change', this.onResourceChanged.bind(this))
                .on('unlink', this.onResourceRemoved.bind(this));
        }
    }

    /**
     * Gets attached file watcher.
     */
    public get watcher(): FSWatcher {
        return this._watcher;
    }

    /**
     * Folder to enumerate.
     */
    public directory: string;

    /**
     * A value indicating whether to include subfolders.
     */
    public includeSubFolders: boolean = true;

    /**
     * Refresh any cached content and look for new content.
     */
    public refresh(): void {
        this._resources.clear();
        const files: string[] = PathUtil.getFiles(this.directory, this.includeSubFolders);
        const filteredFiles: string[] = files.filter((filename): boolean => this.resourceExplorer.resourceTypes.has(extname(filename).toLowerCase().replace(/^\./, '')));
        for (let i = 0; i < filteredFiles.length; i++) {
            const filename = filteredFiles[i];
            const fileResource: FileResource = new FileResource(filename);
            this._resources.set(fileResource.id, fileResource);
        }
    }

    /**
     * Get resource by its id.
     * @param id resource id
     */
    public getResource(id: string): Resource {
        return this._resources.has(id) ? this._resources.get(id) : undefined;
    }

    /**
     * Get resources by extension.
     * @param extension resource extension
     */
    public getResources(extension: string): Resource[] {
        extension = extension.startsWith('.') ? extension.toLowerCase() : `.${ extension.toLowerCase() }`;

        let resources: Resource[] = [];

        for (let key of this._resources.keys()) {
            if (key.toLowerCase().endsWith(extension)) {
                resources.push(this._resources.get(key));
            }
        }

        return resources;
    }

    public toString(): string {
        return this._id;
    }

    private onResourceAdded(path: string): void {
        const ext = extname(path.toLowerCase()).replace(/^\./, '');
        if (this.resourceExplorer.resourceTypes.has(ext)) {
            const fileResource = new FileResource(path);
            if (!this._resources.has(fileResource.id)) {
                this._resources.set(fileResource.id, fileResource);
                this.onChanged(ResourceChangeEvent.added, [fileResource]);
            }
        }
    }

    private onResourceChanged(path: string): void {
        const ext = extname(path.toLowerCase()).replace(/^\./, '');
        if (this.resourceExplorer.resourceTypes.has(ext)) {
            const fileResource = new FileResource(path);
            this._resources.set(fileResource.id, fileResource);
            if (this._resources.has(fileResource.id)) {
                this.onChanged(ResourceChangeEvent.changed, [fileResource]);
            } else {
                // sometimes adding a file will also trigger 'change' event
                this.onChanged(ResourceChangeEvent.added, [fileResource]);
            }
        }
    }

    private onResourceRemoved(path: string): void {
        const ext = extname(path.toLowerCase()).replace(/^\./, '');
        if (this.resourceExplorer.resourceTypes.has(ext)) {
            const fileResource = new FileResource(path);
            if (this._resources.has(fileResource.id)) {
                this._resources.delete(fileResource.id);
                this.onChanged(ResourceChangeEvent.removed, [fileResource]);
            }
        }
    }
}