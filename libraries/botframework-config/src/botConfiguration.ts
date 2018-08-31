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
import { BotRecipe } from './botRecipe';
import * as encrypt from './encrypt';
import { ConnectedService } from './models';
import { IBotConfiguration, IConnectedService, IDispatchService, ILuisService, IQnAService, ServiceTypes } from './schema';
let exec = util.promisify(require('child_process').exec);

interface internalBotConfig {
    location?: string;
}

// This class adds loading and saving from disk and encryption/decryption semantics on top of BotConfigurationBase
export class BotConfiguration extends BotConfigurationBase {

    private internal: internalBotConfig = {};

    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfiguration {
        let { name = '', description = '', version = '2.0', secretKey = '', services = [] } = source;
        services = <IConnectedService[]>services.slice().map(BotConfigurationBase.serviceFromJSON);
        const botConfig = new BotConfiguration();
        Object.assign(botConfig, { services, description, name, version, secretKey });
        return botConfig;
    }

    // load first bot in a folder
    public static async loadBotFromFolder(folder?: string, secret?: string): Promise<BotConfiguration> {
        folder = folder || process.cwd();
        let files = await fsx.readdir(folder);
        files = files.sort();
        for (var file of files) {
            if (path.extname(<string>file) == '.bot') {
                return await BotConfiguration.load(folder + '/' + <string>file, secret);
            }
        }
        throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
    }

    // load first bot in a folder (blocking)
    public static loadBotFromFolderSync(folder?: string, secret?: string): BotConfiguration {
        folder = folder || process.cwd();
        let files = fsx.readdirSync(folder);
        files = files.sort();
        for (var file of files) {
            if (path.extname(<string>file) == '.bot') {
                return BotConfiguration.loadSync(folder + '/' + <string>file, secret);
            }
        }
        throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
    }

    // load the config from a file 
    public static async load(botpath: string, secret?: string): Promise<BotConfiguration> {
        let json = await txtfile.read(botpath);
        let bot = BotConfiguration._load(json, secret);
        bot.internal.location = botpath;
        return bot;
    }

    // load the config from a file (blocking)
    public static loadSync(botpath: string, secret?: string): BotConfiguration {
        let json = txtfile.readSync(botpath);
        let bot = BotConfiguration._load(json, secret);
        bot.internal.location = botpath;
        return bot;
    }

    // save the config file to specificed botpath
    public async saveAs(botpath: string, secret?: string): Promise<void> {
        if (!botpath) {
            throw new Error(`missing path`);
        }

        this._savePrep(secret);

        let hasSecret = !!this.secretKey;

        if (hasSecret)
            this.encrypt(secret);

        await fsx.writeJson(botpath, this.toJSON(), { spaces: 4 });

        if (hasSecret)
            this.decrypt(secret);
    }

    // save the config file to specificed botpath
    public saveAsSync(botpath: string, secret?: string): void {
        this._savePrep(secret);

        let hasSecret = !!this.secretKey;

        if (hasSecret)
            this.encrypt(secret);

        fsx.writeJsonSync(botpath, this.toJSON(), { spaces: 4 });

        if (hasSecret)
            this.decrypt(secret);
    }

    // save the config file back over original
    public async save(secret?: string): Promise<void> {
        return this.saveAs(this.internal.location, secret);
    }

    // save the config file back over original (blocking)
    public saveSync(secret?: string): void {
        return this.saveAsSync(this.internal.location, secret);
    }

    private _savePrep(secret?: string) {
        if (!!secret) {
            this.validateSecretKey(secret);
        }

        // make sure that all dispatch serviceIds still match services that are in the bot
        for (let service of this.services) {
            if (service.type == ServiceTypes.Dispatch) {
                let dispatchService = <IDispatchService>service;
                let validServices = [];
                for (let dispatchServiceId of dispatchService.serviceIds) {
                    for (let service of this.services) {
                        if (service.id == dispatchServiceId) {
                            validServices.push(dispatchServiceId);
                        }
                    }
                }
                dispatchService.serviceIds = validServices;
            }
        }
    }

    private static _load(json: string, secret?: string): BotConfiguration {
        let bot = BotConfiguration.fromJSON(JSON.parse(json));

        let hasSecret = !!bot.secretKey;
        if (hasSecret)
            bot.decrypt(secret);

        return bot;
    }

    public clearSecret() {
        this.secretKey = '';
    }

    // Generate a key for encryption
    public static generateKey(): string {
        return encrypt.generateKey();
    }

    // encrypt all values in the config
    public encrypt(secret: string) {
        this.validateSecretKey(secret);

        for (let service of this.services) {
            (<ConnectedService>service).encrypt(secret, encrypt.encryptString);
        }
    }

    // decrypt all values in the config
    public decrypt(secret?: string) {
        try {
            this.validateSecretKey(secret);

            for (let service of this.services) {
                (<ConnectedService>service).decrypt(secret, encrypt.decryptString);
            }
        }
        catch (err) {
            try {

                // legacy decryption
                this.secretKey = encrypt.legacyDecrypt(this.secretKey, secret);
                this.clearSecret();
                this.version = "2.0";

                let encryptedProperties: { [key: string]: string[]; } = {
                    abs: [],
                    endpoint: ['appPassword'],
                    luis: ['authoringKey', 'subscriptionKey'],
                    dispatch: ['authoringKey', 'subscriptionKey'],
                    file: [],
                    qna: ['subscriptionKey']
                };

                for (var service of this.services) {
                    for (let i = 0; i < encryptedProperties[service.type].length; i++) {
                        let prop = encryptedProperties[service.type][i];
                        let val = <string>(<any>service)[prop];
                        (<any>service)[prop] = encrypt.legacyDecrypt(val, secret);
                    }
                }

                // assign new ids

                // map old ids -> new Ids
                let map = {};

                let oldServices = this.services;
                this.services = [];
                for (let oldService of oldServices) {
                    // connecting causes new ids to be created
                    let newServiceId = this.connectService(oldService);
                    map[oldService.id] = newServiceId;
                }

                // fix up dispatch serviceIds to new ids
                for (let service of this.services) {
                    if (service.type == ServiceTypes.Dispatch) {
                        let dispatch = (<IDispatchService>service);
                        for (let i = 0; i < dispatch.serviceIds.length; i++) {
                            dispatch.serviceIds[i] = map[dispatch.serviceIds[i]];
                        }
                    }
                }

            } catch (err2) {
                throw err;
            }

            return service;
        }
    }

    // return the path that this config was loaded from.  .save() will save to this path 
    public getPath(): string {
        return this.internal.location;
    }


    // make sure secret is correct by decrypting the secretKey with it
    public validateSecretKey(secret: string): void {
        if (!secret) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is missing');
        }

        try {
            if (!this.secretKey || this.secretKey.length == 0) {
                // if no key, create a guid and enrypt that to use as secret validator
                this.secretKey = encrypt.encryptString(uuid(), secret);
            } else {
                // validate we can decrypt the secretKey, this tells us we have the correct secret for the rest of the file.
                encrypt.decryptString(this.secretKey, secret);
            }
        } catch (ex) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is incorrect.');
        }
    }

    // export the services from the bot file as resource files and recipe file
    public async export(folder: string, progress?: (service: IConnectedService, command: string, index: number, total: number) => void): Promise<BotRecipe> {
        let recipe = new BotRecipe();

        await fsx.ensureDir(folder);

        let index = 0;
        for (let service of this.services) {
            index++;
            try {

                switch (service.type) {
                    case ServiceTypes.Dispatch:
                    case ServiceTypes.Luis:
                        {
                            let luisService = <ILuisService>service;
                            let command = `luis export version --appId ${luisService.appId} --authoringKey ${luisService.authoringKey} --versionId "${luisService.version}"`;
                            if (progress) {
                                progress(service, command, index, this.services.length);
                            }
                            let p = await exec(command);
                            var json = p.stdout;
                            // make sure it's json
                            JSON.parse(json);
                            await fsx.writeFile(folder + `/${luisService.id}.luis`, json, { encoding: 'utf8' });
                            recipe.services.push({
                                type: service.type,
                                id: service.id,
                                name: service.name,
                                serviceName: service.name
                            });
                        }
                        break;

                    case ServiceTypes.QnA:
                        {
                            let qnaService = <IQnAService>service;
                            let command = `qnamaker export kb --kbId ${qnaService.kbId} --environment prod --subscriptionKey ${qnaService.subscriptionKey} --hostname ${qnaService.hostname} --endpointKey ${qnaService.endpointKey}`;
                            if (progress) {
                                progress(service, command, index, this.services.length);
                            }
                            let p = await exec(command);
                            var json = p.stdout;
                            // make sure it's json
                            JSON.parse(json);
                            await fsx.writeFile(folder + `/${qnaService.id}.qna`, json, { encoding: 'utf8' });
                            recipe.services.push({
                                type: service.type,
                                id: service.id,
                                name: service.name,
                                serviceName: service.name
                            });
                        }
                        break;

                    default:
                        if (progress) {
                            progress(service, '', index, this.services.length);
                        }
                        recipe.services.push({
                            type: service.type,
                            id: service.id,
                            name: service.name,
                            serviceName: service.name
                        });
                        break;
                }
            } catch (error) {

            }
        }
        await fsx.writeFile(folder + `/${this.name}.bot.recipe`, JSON.stringify(recipe, null, 2), { encoding: 'utf8' });
        return recipe;
    }
}

