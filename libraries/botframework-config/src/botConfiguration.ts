/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as crypto from 'crypto';
import * as fsx from 'fs-extra';
import * as path from 'path';
import * as process from 'process';
import * as txtfile from 'read-text-file';
import * as uuid from 'uuid';
import * as encrypt from './encrypt';
import { AppInsightsService, BlobStorageService, BotService, ConnectedService, CosmosDbService, DispatchService, EndpointService, FileService, GenericService, LuisService, QnaMakerService } from './models';
import { IAppInsightsService, IBlobStorageService, IBotConfiguration, IBotService, IConnectedService, ICosmosDBService, IDispatchService, IEndpointService, IFileService, IGenericService, ILuisService, IQnAService, ServiceTypes } from './schema';


interface internalBotConfig {
    location?: string;
}

export class BotConfiguration implements Partial<IBotConfiguration> {
    // internal is not serialized
    private internal: internalBotConfig = {
    };

    public name: string = '';
    public description: string = '';
    public services: IConnectedService[] = [];
    public secretKey = '';
    public version = '2.0';

    constructor() {
    }

    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfiguration {
        let { name = '', description = '', version = '2.0', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfiguration.serviceFromJSON);
        const botConfig = new BotConfiguration();
        Object.assign(botConfig, { services, description, name, version, secretKey });
        return botConfig;
    }

    public toJSON(): Partial<IBotConfiguration> {
        const { name, description, version, secretKey, services } = this;
        return { name, description, version, secretKey, services };
    }

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

    // load the config file
    public static async load(botpath: string, secret?: string): Promise<BotConfiguration> {
        let bot = BotConfiguration.fromJSON(JSON.parse(await txtfile.read(botpath)));
        bot.internal.location = botpath;

        let hasSecret = !!bot.secretKey;
        if (hasSecret)
            bot.decrypt(secret);

        return bot;
    }

    // save the config file to specificed botpath
    public async saveAs(botpath: string, secret?: string): Promise<void> {
        if (!!secret) {
            this.validateSecretKey(secret);
        }

        let hasSecret = !!this.secretKey;

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

        if (hasSecret)
            this.encrypt(secret);

        await fsx.writeJson(botpath || <string>this.internal.location, this.toJSON(), { spaces: 4 });

        if (hasSecret)
            this.decrypt(secret);
    }

    // save the config file back over original
    public async save(secret?: string): Promise<void> {
        return this.saveAs(this.internal.location, secret);
    }

    public clearSecret() {
        this.secretKey = '';
    }

    // connect to a service
    // returns assignd id for the service
    public connectService(newService: IConnectedService): string {
        let service = BotConfiguration.serviceFromJSON(newService);

        // assign a unique id
        let found = false;
        do {
            found = false;
            service.id = '' + Math.floor((Math.random() * 255));
            for (let existingService of this.services) {
                if (existingService.id == service.id) {
                    found = true;
                    break;
                }
            }
        } while (found);

        this.services.push(service);
        return service.id;
    }

    // Generate a key for encryption
    public static generateKey(): string {
        return encrypt.generateKey();
    }

    // encrypt all values in the config
    public encrypt(secret: string) {
        this.validateSecretKey(secret);

        for (let service of this.services) {
            (<ConnectedService>service).encrypt(secret);
        }
    }

    // decrypt all values in the config
    public decrypt(secret?: string) {
        try {
            this.validateSecretKey(secret);

            for (let service of this.services) {
                (<ConnectedService>service).decrypt(secret);
            }
        }
        catch (err) {
            try {

                // legacy decryption
                this.secretKey = this.legacyDecrypt(this.secretKey, secret);
                this.secretKey = "";

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
                        (<any>service)[prop] = this.legacyDecrypt(val, secret);
                    }
                }
            } catch (err2) {
                throw err;
            }

            return service;
        }
    }

    // find a service by id
    public findService(id: string): IConnectedService {
        const { services = [] } = this;
        let i = services.length;
        while (i--) {
            const service = services[i];
            if (service.id == id) {
                return service;
            }
        }
        return null;
    }

    // find a service by name or id
    public findServiceByNameOrId(nameOrId: string): IConnectedService {
        const { services = [] } = this;
        let i = services.length;
        while (i--) {
            const service = services[i];
            if (service.id == nameOrId || service.name == nameOrId) {
                return service;
            }
        }
        return null;
    }

    // remove service by name or id
    public disconnectServiceByNameOrId(nameOrId: string): IConnectedService {
        const { services = [] } = this;
        let i = services.length;
        while (i--) {
            const service = services[i];
            if (service.id == nameOrId || service.name == nameOrId) {
                return services.splice(i, 1)[0];
            }
        }
        throw new Error(`a service with id or name of [${nameOrId}] was not found`);
    }

    // remove a service
    public disconnectService(id: string): void {
        const { services = [] } = this;
        let i = services.length;
        while (i--) {
            const service = services[i];
            if (service.id == id) {
                services.splice(i, 1)[0];
                return;
            }
        }
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


    private legacyDecrypt(encryptedValue: string, secret: string): string {
        // LEGACY for pre standardized SHA256 encryption, this uses some undocumented nodejs MD5 hash internally and is deprecated
        const decipher = crypto.createDecipher('aes192', secret);
        let value = decipher.update(encryptedValue, 'hex', 'utf8');
        value += decipher.final('utf8');
        return value;
    }

    public static serviceFromJSON(service: IConnectedService): ConnectedService {
        switch (service.type) {
            case ServiceTypes.File:
                return new FileService(<IFileService>service);

            case ServiceTypes.QnA:
                return new QnaMakerService(<IQnAService>service);

            case ServiceTypes.Dispatch:
                return new DispatchService(<IDispatchService>service);

            case ServiceTypes.Bot:
                return new BotService(<IBotService>service);

            case ServiceTypes.Luis:
                return new LuisService(<ILuisService>service);

            case ServiceTypes.Endpoint:
                return new EndpointService(<IEndpointService>service);

            case ServiceTypes.AppInsights:
                return new AppInsightsService(<IAppInsightsService>service);

            case ServiceTypes.BlobStorage:
                return new BlobStorageService(<IBlobStorageService>service);

            case ServiceTypes.CosmosDB:
                return new CosmosDbService(<ICosmosDBService>service);

            case ServiceTypes.Generic:
                return new GenericService(<IGenericService>service);

            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }

}

