"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("async-file");
const file = require("fs");
const filenamify = require("filenamify");
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
class FileStorage {
    /**
     * Creates a new FileStorage instance.
     * @param path Root filesystem path for where the provider should store its items.
     */
    constructor(path) {
        this.path = path;
    }
    read(keys) {
        return this.ensureFolder().then(() => {
            const data = {};
            const promises = [];
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
    write(changes) {
        return this.ensureFolder().then(() => {
            let promises = [];
            for (const key in changes) {
                const filePath = this.getFilePath(key);
                const p = parseFile(filePath).then((old) => {
                    if (old === undefined || changes[key].eTag === '*' || old.eTag === changes[key].eTag) {
                        const newObj = Object.assign({}, changes[key]);
                        newObj.eTag = (FileStorage.nextTag++).toString();
                        return fs.writeTextFile(filePath, JSON.stringify(newObj));
                    }
                    else {
                        throw new Error(`FileStorage: eTag conflict for "${filePath}"`);
                    }
                });
                promises.push(p);
            }
            return Promise.all(promises).then(() => { });
        });
    }
    ;
    delete(keys) {
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
    ensureFolder() {
        if (!this.pEnsureFolder) {
            this.pEnsureFolder = fs.exists(this.path).then((exists) => {
                if (!exists) {
                    return fs.mkdirp(this.path);
                }
            });
        }
        return this.pEnsureFolder;
    }
    getFileName(key) {
        return filenamify(key);
    }
    getFilePath(key) {
        return path.join(this.path, this.getFileName(key));
    }
}
FileStorage.nextTag = 0;
exports.FileStorage = FileStorage;
/**
 * @private
 * @param filePath
 */
function parseFile(filePath) {
    return fs.exists(filePath)
        .then((exists) => exists ? fs.readTextFile(filePath) : Promise.resolve(undefined))
        .then((data) => {
        try {
            if (data) {
                return JSON.parse(data);
            }
        }
        catch (err) {
            console.warn(`FileStorage: error parsing "${filePath}": ${err.toString()}`);
        }
        return undefined;
    })
        .catch((err) => {
        console.warn(`FileStorage: error reading "${filePath}": ${err.toString()}`);
        return undefined;
    });
}
//# sourceMappingURL=fileStorage.js.map