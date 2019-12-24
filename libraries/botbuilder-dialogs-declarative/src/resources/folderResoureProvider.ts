import { FileResource } from "./fileResource";
import { normalize, extname } from "path";
import { IResource } from "./resource";
import { IResourceProvider } from "./resourceProvider";
import { PathUtil } from "../pathUtil";
import watch from "node-watch";
import { EventEmitter } from "events";

/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class FolderResourceProvider implements IResourceProvider {
    private extensions: Set<string> = new Set<string>();

    private _emitter: EventEmitter;

    set emitter(e: EventEmitter) {
        this._emitter = e;
    }

    private resources: Map<string, FileResource> = new Map<string, FileResource>();

    public includeSubFolders: boolean;

    public directory: string;

    constructor(folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true) {

        const extensionsToInclude: string[] = [".lg", ".qna", ".lu", ".dialog", ".schema", ".md"];

        extensionsToInclude.forEach(e => this.extensions.add(e));

        this.includeSubFolders = includeSubFolders;
        folder = normalize(folder);
        this.directory = folder;
        const allFiles: string[] = PathUtil.getAllFiles(folder);
        const allFilteredFiles: string[] = allFiles.filter(f => this.extensions.has(extname(f)));

        allFilteredFiles.forEach(f => {
            const fileResource: FileResource = new FileResource(f);
            this.resources.set(fileResource.id(), fileResource);
        });

        if (monitorChanges) {
            watch(folder, { recursive: true }, (type, filename) => {
                this._emitter.emit("changed", new FileResource(filename));
            });
        }
    }

    public async getResource(id: string): Promise<IResource> {
        return this.resources.has(id) ? this.resources.get(id) : null;
    }

    public async getResources(extension: string): Promise<IResource[]> {
        extension = `.${extension.toLowerCase()}`;

        let filteredResources: IResource[] = [];

        for (let key of this.resources.keys()) {
            if (key.toLowerCase().endsWith(extension)) {
                filteredResources.push(this.resources.get(key));
            }
        }

        return filteredResources;
    }

    public id(): string {
        return this.directory;
    }


}