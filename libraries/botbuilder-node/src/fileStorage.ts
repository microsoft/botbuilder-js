/**
 * @module botbuilder-node
 */
/** second comment block */
import { Storage, StorageMiddleware, StorageSettings, StoreItems, StoreItem } from 'botbuilder';
import * as path from 'path';
import * as fs from 'async-file';
import * as file from 'fs';
import * as os from 'os';
import * as filenamify from 'filenamify';

/** Additional settings for configuring an instance of [FileStorage](../classes/botbuilder_node.filestorage.html). */
export interface FileStorageSettings extends StorageSettings {
    /** 
     * (Optional) path to the backing folder. The default is to use a `storage` folder off
     * the systems temporary directory. 
     */
    path?: string;
}

/**
 * Middleware that implements a file based storage provider for a bot.
 * 
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * bot.use(new FileStorage({
 *      path: path.join(__dirname, 'storage')
 * }));
 * ```
 */
export class FileStorage extends StorageMiddleware<FileStorageSettings> implements Storage {
    private checked: boolean;

    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    public constructor(settings?: FileStorageSettings) {
        super(settings || {});
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
    public read(keys: string[]): Promise<StoreItems> {
        return this.ensureFolder()
            .then(() => {
                let data: StoreItems = {};
                let promises: Promise<any>[] = [];
                for (const iKey in keys) {
                    let key = keys[iKey];
                    let filePath = this.getFilePath(key);
                    promises.push(
                        fs.exists(filePath)
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
                            })
                    );
                }

                return Promise.all(promises).then(() => data);
            });
    };

    /** 
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.  
     **/
    public write(changes: StoreItems): Promise<void> {
        return this.ensureFolder()
            .then(() => {
                let promises: Promise<void>[] = [];
                for (const key in changes) {
                    let filePath = this.getFilePath(key);
                    promises.push(
                        fs.exists(filePath)
                            .then((exists) => {
                                if (exists)
                                    return fs.readTextFile(filePath);
                                else
                                    return Promise.resolve(undefined);
                            })
                            .then((json) => {
                                let old: StoreItem = (json) ? JSON.parse(json) : null;
                                if (old == null || changes[key].eTag == '*' || old.eTag == changes[key].eTag) {
                                    let newObj: StoreItem = Object.assign({}, changes[key]);
                                    newObj.eTag = (parseInt(newObj.eTag || '0') + 1).toString();
                                    return fs.writeTextFile(filePath, JSON.stringify(newObj));
                                } else {
                                    throw new Error('eTag conflict');
                                }
                            })
                    );
                }
                return Promise.all(promises).then(() => { });
            });
    };

    /** 
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store. 
     **/
    public delete(keys: string[]): Promise<void> {
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

    /** INTERNAL method that returns the storage instance to be added to the context object. */
    protected getStorage(context: BotContext): Storage {
        return this;
    }

    private ensureFolder(): Promise<void> {
        if (!this.checked) {
            return fs.exists(<string>this.settings.path)
                .then((exists) => {
                    if (!exists) {
                        return fs.mkdirp(<string>this.settings.path)
                            .then(() => { this.checked = true; });
                    }
                });
        }
        return Promise.resolve();
    }

    private getFileName(key: string): string {
        return filenamify(key);
    }

    private getFilePath(key: string): string {
        return path.join(<string>this.settings.path, this.getFileName(key));
    }

    private hashCode(input: string): number {
        var hash = 0;
        if (input.length == 0) return hash;
        for (let i = 0; i < input.length; i++) {
            let char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
}
