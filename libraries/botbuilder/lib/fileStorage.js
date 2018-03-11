"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("async-file");
const file = require("fs");
const os = require("os");
const filenamify = require("filenamify");
/**
 * :package: **botbuilder**
 *
 * A file based storage provider.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 */
class FileStorage {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    constructor(settings) {
        this.path = settings && settings.path ? settings.path : path.join(os.tmpdir(), 'storage');
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
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
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
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
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
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
                    return fs.mkdirp(this.path).catch((err) => {
                        console.error(`FileStorage: error creating directory for "${this.path}": ${err.toString()}`);
                        throw err;
                    });
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
    hashCode(input) {
        var hash = 0;
        if (input.length == 0)
            return hash;
        for (let i = 0; i < input.length; i++) {
            let char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}
FileStorage.nextTag = 0;
exports.FileStorage = FileStorage;
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