import { debug } from "util";

/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const path = require('path');
const fs = require('fs');
const { readdir, stat } = require('fs').promises;


export interface IResourceProvider {
    getResource(id: string) : Promise<IResource>;
}

export class FileResourceProvider implements IResourceProvider {
    
    private directories: string[] = [];

    public registerDirectory(path: string) : void {
        if (!path) {
            throw new Error(`FileResourceProvideR: 'path' is required to register a directory`);
        }

        this.directories.push(path);
    }

    public async getResources(fileExtension: string) : Promise<IResource[]> {
        
        if (!fileExtension) {
            throw new Error(`ResourceProvider: file extension should be provided`);
        }

        // Normalize extensions to include the starting '.' character to match file libraries expectations
        if (fileExtension[0] != '.') {
            fileExtension = `.${fileExtension}`;
        }
        let resources: IResource[] = [];

        for(const dir of this.directories) {
            const files: string[] = await this.getFilesRecursive(dir);

            for(const file of files) {
                if (path.extname(file) == fileExtension) {
                    resources.push(new FileResource(file));
                }   
            }   
        }

        return resources;
    }

    public async getResource(id: string) : Promise<IResource> {
        
        if(!id) {
            throw new Error(`Resource id must be provided.`);
        }

        const resources: IResource[] = await this.getResources(path.extname(id));
        
        for(let resource of resources) {
            if (resource.id() == id) {
                return resource;
            }
        }

        return null;
    }

    private async getFilesRecursive(dir: string) : Promise<string[]> {
        const subdirs = await readdir(dir);
        const files = await Promise.all(subdirs.map(async (subdir) => {
          const res = path.resolve(dir, subdir);
          return (await stat(res)).isDirectory() ? this.getFilesRecursive(res) : res;
        }));
        return Array.prototype.concat(...files);
    }
}

export interface IResource {
    id(): string;
    readText() : Promise<string>;
}

export class FileResource implements IResource {

    private resourceId: string; 
    private path: string;

    constructor(path: string) {
        if (!path) {
            throw new Error("path");
        }

        this.path = path;
        
        // The id will be the file name, without the path
        this.resourceId = this.path.replace(/^.*[\\\/]/, '');
    }

    public id(): string {
        return this.resourceId;
    }

    public readText() : Promise<string> {
        const filePath = this.path;
        return new Promise<string>(function(resolve, reject) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                err ? reject(err) : resolve(data)
            });
        });
    }
}