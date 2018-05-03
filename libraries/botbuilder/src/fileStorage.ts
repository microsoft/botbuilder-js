/**
 * @module botbuilder-node
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Storage, StoreItems, StoreItem } from 'botbuilder-core-extensions';
import * as path from 'path';
import * as fs from 'async-file';
import * as file from 'fs';
import * as os from 'os';
import * as filenamify from 'filenamify';

/**
 * A file based storage provider. Items will be persisted to a folder on disk.
 *
 * @remarks
 * The following example shows how to construct a configured instance of the provider:
 *
 * ```JavaScript
 * const { FileStorage } = require('botbuilder');
 * const path = require('path');
 *  
 * const storage = new FileStorage(path.join(__dirname, './state'));
 * ```
 */
export class FileStorage implements Storage {
    static nextTag = 0;
    private pEnsureFolder: Promise<void>|undefined;

    /**
     * Creates a new FileStorage instance.
     * @param path Root filesystem path for where the provider should store its items.
     */
    public constructor(protected readonly path: string) { }

    public read(keys: string[]): Promise<StoreItems> {
        return this.ensureFolder().then(() => {
            const data: StoreItems = {};
            const promises: Promise<any>[] = [];
            for (const iKey in keys) {
                const key = keys[iKey];
                const filePath = this.getFilePath(key);
                const p = parseFile(filePath).then((obj) => {
                    if (obj) {
                        data[key] = obj;
                    }
                });
                promises.push(p);
            }

            return Promise.all(promises).then(() => data);
        });
    }

    public write(changes: StoreItems): Promise<void> {
        return this.ensureFolder().then(() => {
                let promises: Promise<void>[] = [];
                for (const key in changes) {
                    const filePath = this.getFilePath(key);
                    const p = parseFile(filePath).then((old: StoreItem|undefined) => {
                            if (old === undefined || changes[key].eTag === '*' || old.eTag === changes[key].eTag) {
                                const newObj = Object.assign({}, changes[key]);
                                newObj.eTag = (FileStorage.nextTag++).toString();
                                return fs.writeTextFile(filePath, JSON.stringify(newObj));
                            } else {
                                throw new Error(`FileStorage: eTag conflict for "${filePath}"`);
                            }
                        });
                    promises.push(p);
                }

                return Promise.all(promises).then(() => { });
            });
    };

    public delete(keys: string[]): Promise<void> {
        return this.ensureFolder().then(() => {
                const promises = [];
                for (let iKey in keys) {
                    const key = keys[iKey];
                    const filePath = this.getFilePath(key);
                    const p = fs.exists(filePath).then((exists) => {
                            if (exists) {
                                file.unlinkSync(filePath);
                            }
                        });
                    promises.push(p);
                }
                Promise.all(promises).then(() => { });
            });
    }

    private ensureFolder(): Promise<void> {
        if (!this.pEnsureFolder) {
            this.pEnsureFolder = fs.exists(this.path).then((exists) => {
                if (!exists) {
                    return fs.mkdirp(this.path);
                }
            });
        }
        return this.pEnsureFolder;
    }

    private getFileName(key: string): string {
        return filenamify(key);
    }

    private getFilePath(key: string): string {
        return path.join(this.path, this.getFileName(key));
    }
}

/**
 * @private
 * @param filePath 
 */
function parseFile(filePath: string): Promise<Object|undefined> {
    return fs.exists(filePath)
        .then((exists) => exists ? fs.readTextFile(filePath) : Promise.resolve(undefined))
        .then((data) => {
            try {
                if (data) {
                    return JSON.parse(data);
                }
            } catch (err) {
                console.warn(`FileStorage: error parsing "${filePath}": ${err.toString()}`);
            }
            return undefined;
        })
        .catch((err) => {
            console.warn(`FileStorage: error reading "${filePath}": ${err.toString()}`);
            return undefined;
        });
}