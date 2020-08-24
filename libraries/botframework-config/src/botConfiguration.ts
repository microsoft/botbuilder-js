/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as process from 'process';
import * as txtfile from 'read-text-file';
import * as util from 'util';
import * as uuid from 'uuid';
import { BotConfigurationBase } from './botConfigurationBase';
import * as encrypt from './encrypt';
/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ConnectedService } from './models';
import { IBotConfiguration, IConnectedService, IDispatchService, ServiceTypes } from './schema';
// tslint:disable-next-line:no-var-requires no-require-imports
const exec: Function = util.promisify(require('child_process').exec);

/**
 * @private
 */
interface InternalBotConfig {
    location?: string;
}

/**
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class BotConfiguration extends BotConfigurationBase {

    private internal: InternalBotConfig = {};

    /**
     * Returns a new BotConfiguration instance given a JSON based configuration.
     * @param source JSON based configuration.
     */
    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfiguration {
        // tslint:disable-next-line:prefer-const
        const services: IConnectedService[] = (source.services) ? source.services.slice().map(BotConfigurationBase.serviceFromJSON) : [];
        const botConfig: BotConfiguration = new BotConfiguration();
        Object.assign(botConfig, source);

        // back compat for secretKey rename
        if (!botConfig.padlock && (<any>botConfig).secretKey) {
            botConfig.padlock = (<any>botConfig).secretKey;
            delete (<any>botConfig).secretKey;
        }
        botConfig.services = services;
        botConfig.migrateData();

        return botConfig;
    }

    /**
     * Load the bot configuration by looking in a folder and loading the first .bot file in the
     * folder.
     * @param folder (Optional) folder to look for bot files. If not specified the current working directory is used.
     * @param secret (Optional) secret used to decrypt the bot file.
     */
    public static async loadBotFromFolder(folder?: string, secret?: string): Promise<BotConfiguration> {
        folder = folder || process.cwd();
        let files: string[] = await fsx.readdir(folder);
        files = files.sort();
        for (const file of files) {
            if (path.extname(<string>file) === '.bot') {
                return await BotConfiguration.load(`${ folder }/${ <string>file }`, secret);
            }
        }
        throw new Error(`Error: no bot file found in ${ folder }. Choose a different location or use msbot init to create a .bot file."`);
    }

    /**
     * Load the bot configuration by looking in a folder and loading the first .bot file in the
     * folder. (blocking)
     * @param folder (Optional) folder to look for bot files. If not specified the current working directory is used.
     * @param secret (Optional) secret used to decrypt the bot file.
     */
    public static loadBotFromFolderSync(folder?: string, secret?: string): BotConfiguration {
        folder = folder || process.cwd();
        let files: string[] = fsx.readdirSync(folder);
        files = files.sort();
        for (const file of files) {
            if (path.extname(<string>file) === '.bot') {
                return BotConfiguration.loadSync(`${ folder }/${ <string>file }`, secret);
            }
        }
        throw new Error(`Error: no bot file found in ${ folder }. Choose a different location or use msbot init to create a .bot file."`);
    }

    /**
     * Load the configuration from a .bot file.
     * @param botpath Path to bot file.
     * @param secret (Optional) secret used to decrypt the bot file.
     */
    public static async load(botpath: string, secret?: string): Promise<BotConfiguration> {
        const json: string = await txtfile.read(botpath);
        const bot: BotConfiguration = BotConfiguration.internalLoad(json, secret);
        bot.internal.location = botpath;

        return bot;
    }

    /**
     * Load the configuration from a .bot file. (blocking)
     * @param botpath Path to bot file.
     * @param secret (Optional) secret used to decrypt the bot file.
     */
    public static loadSync(botpath: string, secret?: string): BotConfiguration {
        const json: string = txtfile.readSync(botpath);
        const bot: BotConfiguration = BotConfiguration.internalLoad(json, secret);
        bot.internal.location = botpath;

        return bot;
    }

    /**
     * Generate a new key suitable for encrypting.
     */
    public static generateKey(): string {
        return encrypt.generateKey();
    }

    private static internalLoad(json: string, secret?: string): BotConfiguration {
        const bot: BotConfiguration = BotConfiguration.fromJSON(JSON.parse(json));

        const hasSecret = !!bot.padlock;
        if (hasSecret) {
            bot.decrypt(secret);
        }

        return bot;
    }

    /**
     * Save the configuration to a .bot file.
     * @param botpath Path to bot file.
     * @param secret (Optional) secret used to encrypt the bot file.
     */
    public async saveAs(botpath: string, secret?: string): Promise<void> {
        if (!botpath) {
            throw new Error(`missing path`);
        }

        this.internal.location = botpath;

        this.savePrep(secret);

        const hasSecret = !!this.padlock;

        if (hasSecret) {
            this.encrypt(secret);
        }
        await fsx.writeJson(botpath, this.toJSON(), { spaces: 4 });

        if (hasSecret) {
            this.decrypt(secret);
        }
    }

    /**
     * Save the configuration to a .bot file. (blocking)
     * @param botpath Path to bot file.
     * @param secret (Optional) secret used to encrypt the bot file.
     */
    public saveAsSync(botpath: string, secret?: string): void {
        if (!botpath) {
            throw new Error(`missing path`);
        }
        this.internal.location = botpath;

        this.savePrep(secret);

        const hasSecret = !!this.padlock;

        if (hasSecret) {
            this.encrypt(secret);
        }

        fsx.writeJsonSync(botpath, this.toJSON(), { spaces: 4 });

        if (hasSecret) {
            this.decrypt(secret);
        }
    }

    /**
     * Save the file with secret.
     * @param secret (Optional) secret used to encrypt the bot file.
     */
    public async save(secret?: string): Promise<void> {
        return this.saveAs(this.internal.location, secret);
    }

    /**
     * Save the file with secret. (blocking)
     * @param secret (Optional) secret used to encrypt the bot file.
     */
    public saveSync(secret?: string): void {
        return this.saveAsSync(this.internal.location, secret);
    }

    /**
     * Clear secret.
     */
    public clearSecret(): void {
        this.padlock = '';
    }

    /**
     * Encrypt all values in the in memory config.
     * @param secret Secret to encrypt.
     */
    public encrypt(secret: string): void {
        this.validateSecret(secret);

        for (const service of this.services) {
            (<ConnectedService>service).encrypt(secret, encrypt.encryptString);
        }
    }

    /**
     * Decrypt all values in the in memory config.
     * @param secret Secret to decrypt.
     */
    public decrypt(secret?: string): void {
        try {
            this.validateSecret(secret);

            for (const connected_service of this.services) {
                (<ConnectedService>connected_service).decrypt(secret, encrypt.decryptString);
            }
        } catch (err) {
            try {

                // legacy decryption
                this.padlock = encrypt.legacyDecrypt(this.padlock, secret);
                this.clearSecret();
                this.version = '2.0';

                const encryptedProperties: { [key: string]: string[] } = {
                    abs: [],
                    endpoint: ['appPassword'],
                    luis: ['authoringKey', 'subscriptionKey'],
                    dispatch: ['authoringKey', 'subscriptionKey'],
                    file: [],
                    qna: ['subscriptionKey']
                };

                for (const service of this.services) {
                    for (const prop of encryptedProperties[service.type]) {
                        const val: string = <string>(<any>service)[prop];
                        (<any>service)[prop] = encrypt.legacyDecrypt(val, secret);
                    }
                }

                // assign new ids

                // map old ids -> new Ids
                const map: any = {};

                const oldServices: IConnectedService[] = this.services;
                this.services = [];
                for (const oldService of oldServices) {
                    // connecting causes new ids to be created
                    const newServiceId: string = this.connectService(oldService);
                    map[oldService.id] = newServiceId;
                }

                // fix up dispatch serviceIds to new ids
                for (const service of this.services) {
                    if (service.type === ServiceTypes.Dispatch) {
                        const dispatch: IDispatchService = (<IDispatchService>service);
                        for (let i = 0; i < dispatch.serviceIds.length; i++) {
                            dispatch.serviceIds[i] = map[dispatch.serviceIds[i]];
                        }
                    }
                }

            } catch (err2) {
                throw err;
            }
        }
    }

    /**
     * Return the path that this config was loaded from.  .save() will save to this path.
     */
    public getPath(): string {
        return this.internal.location;
    }

    /**
     * Make sure secret is correct by decrypting the secretKey with it.
     * @param secret Secret to use.
     */
    public validateSecret(secret: string): void {
        if (!secret) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is missing');
        }

        try {
            if (!this.padlock || this.padlock.length === 0) {
                // if no key, create a guid and enrypt that to use as secret validator
                this.padlock = encrypt.encryptString(uuid(), secret);
            } else {
                // validate we can decrypt the padlock, this tells us we have the correct secret for the rest of the file.
                encrypt.decryptString(this.padlock, secret);
            }
        } catch (ex) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is incorrect.');
        }
    }

    private savePrep(secret?: string): void {
        if (!!secret) {
            this.validateSecret(secret);
        }

        // make sure that all dispatch serviceIds still match services that are in the bot
        for (const service of this.services) {
            if (service.type === ServiceTypes.Dispatch) {
                const dispatchService: IDispatchService = <IDispatchService>service;
                const validServices: string[] = [];
                for (const dispatchServiceId of dispatchService.serviceIds) {
                    for (const this_service of this.services) {
                        if (this_service.id === dispatchServiceId) {
                            validServices.push(dispatchServiceId);
                        }
                    }
                }
                dispatchService.serviceIds = validServices;
            }
        }
    }
}

// Make sure the internal field is not included in JSON representation.
Object.defineProperty(BotConfiguration.prototype, 'internal', { enumerable: false, writable: true });
