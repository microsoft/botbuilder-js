/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IResourceProvider } from './resourceProvider';
import { IResource } from './resource';
import { FileResource } from './fileResource';

const path = require('path');
const fs = require('fs');

export class FileResourceProvider implements IResourceProvider {

    private directories: string[] = [];

    public registerDirectory(path: string): void {
        if (!path) {
            throw new Error(`FileResourceProvideR: 'path' is required to register a directory`);
        }

        this.directories.push(path);
    }

    public async getResources(fileExtension: string): Promise<IResource[]> {

        if (!fileExtension) {
            throw new Error(`ResourceProvider: file extension should be provided`);
        }

        // Normalize extensions to include the starting '.' character to match file libraries expectations
        if (fileExtension[0] != '.') {
            fileExtension = `.${fileExtension}`;
        }
        let resources: IResource[] = [];

        for (const dir of this.directories) {
            const files: string[] = this.getFilesRecursive(dir);

            for (const file of files) {
                if (path.extname(file) == fileExtension) {
                    resources.push(new FileResource(file));
                }
            }
        }

        return resources;
    }

    public id(): string {
        return this.directories.toString();
    }

    public async getResource(id: string): Promise<IResource> {

        if (!id) {
            throw new Error(`Resource id must be provided.`);
        }

        const resources: IResource[] = await this.getResources(path.extname(id));

        for (let resource of resources) {
            if (resource.id() == id) {
                return resource;
            }
        }

        return null;
    }

    // TODO: Implement async but without using fs.promise since it is still marked experimental
    // TODO: Cache
    // TODO: Change notification
    private getFilesRecursive(dir: string): string[] {
        var results = [];
        var list = fs.readdirSync(dir);
        for (let file of list) {
            file = path.resolve(dir, file);
            var stat = fs.statSync(file);
            if (stat && stat.isDirectory()) {
                // Subdirectory, recurse
                results = results.concat(this.getFilesRecursive(file));
            } else {
                // File
                results.push(file);
            }
        }
        return results;
    }
}