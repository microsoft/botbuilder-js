"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("async-file");
const file = require("fs");
const os = require("os");
const filenamify = require("filenamify");
/**
 * File based storage provider for a bot.
 */
class FileStorage {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    constructor(settings) {
        this.settings = Object.assign({}, settings);
        this.checked = false;
        if (!this.settings.path) {
            this.settings.path = path.join(os.tmpdir(), 'storage');
        }
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
    read(keys) {
        return this.ensureFolder()
            .then(() => {
            let data = {};
            let promises = [];
            for (const iKey in keys) {
                let key = keys[iKey];
                let filePath = this.getFilePath(key);
                promises.push(fs.exists(filePath)
                    .then((exists) => {
                    if (exists) {
                        return fs.readTextFile(filePath)
                            .catch(() => { })
                            .then(json => {
                            if (json)
                                data[key] = JSON.parse(json);
                        });
                    }
                    return;
                }));
            }
            return Promise.all(promises).then(() => data);
        });
    }
    ;
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes) {
        return this.ensureFolder()
            .then(() => {
            let promises = [];
            for (const key in changes) {
                let filePath = this.getFilePath(key);
                promises.push(fs.exists(filePath)
                    .then((exists) => {
                    if (exists)
                        return fs.readTextFile(filePath);
                    else
                        return Promise.resolve(undefined);
                })
                    .then((json) => {
                    let old = (json) ? JSON.parse(json) : null;
                    if (old == null || changes[key].eTag == '*' || old.eTag == changes[key].eTag) {
                        let newObj = Object.assign({}, changes[key]);
                        newObj.eTag = (parseInt(newObj.eTag || '0') + 1).toString();
                        return fs.writeTextFile(filePath, JSON.stringify(newObj));
                    }
                    else {
                        throw new Error('eTag conflict');
                    }
                }));
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
        return this.ensureFolder()
            .then(() => {
            let tasks = [];
            for (let iKey in keys) {
                let key = keys[iKey];
                let filePath = this.getFilePath(key);
                tasks.push(fs.exists(filePath)
                    .then((exists) => {
                    if (exists)
                        file.unlinkSync(filePath);
                }));
            }
            Promise.all(tasks).then(() => { });
        });
    }
    ensureFolder() {
        if (!this.checked) {
            return fs.exists(this.settings.path)
                .then((exists) => {
                if (!exists) {
                    return fs.mkdirp(this.settings.path)
                        .then(() => { this.checked = true; });
                }
            });
        }
        return Promise.resolve();
    }
    getFileName(key) {
        return filenamify(key);
    }
    getFilePath(key) {
        return path.join(this.settings.path, this.getFileName(key));
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
exports.FileStorage = FileStorage;
//# sourceMappingURL=fileStorage.js.map