/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import watch from 'node-watch';
import { EventEmitter } from 'events';
import { normalize, extname } from 'path';
import { FileResource } from './fileResource';
import { IResource } from './resource';
import { IResourceProvider } from './resourceProvider';
import { PathUtil } from '../pathUtil';

const extensionsToInclude: string[] = ['.lg', '.qna', '.lu', '.dialog', '.schema', '.md'];

export class FolderResourceProvider implements IResourceProvider {
    private _emitter: EventEmitter;

    public set emitter(e: EventEmitter) {
        this._emitter = e;
    }

    private _resources: Map<string, FileResource> = new Map<string, FileResource>();

    public extensions: Set<string> = new Set<string>(extensionsToInclude);

    public directory: string;

    public includeSubFolders: boolean;

    public id(): string {
        return this.directory;
    }

    public constructor(folder: string, includeSubFolders: boolean = true, monitorChanges: boolean = true) {
        this.includeSubFolders = includeSubFolders;
        folder = normalize(folder);
        this.directory = folder;
        let files: string[];
        if (includeSubFolders) {
            files = PathUtil.getAllFiles(folder);
        }
        else {
            files = PathUtil.getFiles(folder);
        }

        const filteredFiles: string[] = files.filter((f): boolean => this.extensions.has(extname(f)));

        for (let i = 0; i < filteredFiles.length; i++) {
            const filename = filteredFiles[i];
            const fileResource: FileResource = new FileResource(filename);
            this._resources.set(fileResource.id(), fileResource);
        }

        if (monitorChanges) {
            watch(folder, { recursive: true, delay: 0}, (type, filename): void => {
                this._emitter.emit('changed', new FileResource(filename));
            });
        }
    }

    public getResource(id: string): IResource {
        return this._resources.has(id) ? this._resources.get(id) : undefined;
    }

    public getResources(extension: string): IResource[] {
        extension = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;

        let resources: IResource[] = [];

        for (let key of this._resources.keys()) {
            if (key.toLowerCase().endsWith(extension)) {
                resources.push(this._resources.get(key));
            }
        }

        return resources;
    }
}