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
import { AzureBotService, ConnectedService, DispatchService, EndpointService, FileService, LuisService, QnaMakerService } from './models';
import { AppInsightsService } from './models/appInsightsService';
import { AzureStorageService } from './models/azureStorageService';
import { IAppInsightsService, IAzureStorageService, IBotConfiguration, IConnectedService, IDispatchService, IEndpointService, IFileService, ILuisService, IQnAService, ServiceTypes } from './schema';


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

    constructor() {
    }

    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfiguration {
        let { name = '', description = '', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfiguration.serviceFromJSON);
        const botConfig = new BotConfiguration();
        Object.assign(botConfig, { services, description, name, secretKey });
        return botConfig;
    }

    public toJSON(): Partial<IBotConfiguration> {
        const { name, description, services, secretKey } = this;
        return { name, description, services, secretKey };
    }

    public static async loadBotFromFolder(folder?: string, secret?: string): Promise<BotConfiguration> {
        let files = await fsx.readdir(folder || process.cwd());

        for (var file in files) {
            if (path.extname(<string>file) == '.bot') {
                return await BotConfiguration.load(<string>file, secret);
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

    // save the config file
    public async save(botpath?: string, secret?: string): Promise<void> {
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

    public clearSecret() {
        this.secretKey = '';
    }

    // connect to a service
    public connectService(newService: IConnectedService): void {
        for (let service of this.services) {
            if (service.type == newService.type && service.id == newService.id)
                throw Error(`service with ${newService.id} already connected`);
        }

        // give unique name
        let nameCount = 1;
        let name = newService.name;

        while (true) {
            if (nameCount > 1) {
                name = `${newService.name} (${nameCount})`;
            }

            let conflict = false;
            for (let service of this.services) {
                if (service.name == name) {
                    conflict = true;
                    break;
                }
            }
            if (!conflict)
                break;
            nameCount++;
        }
        newService.name = name;

        this.services.push(BotConfiguration.serviceFromJSON(newService));
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
    public disconnectService(type: string, id: string): void {
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

            case ServiceTypes.AzureBot:
                return new AzureBotService(<IAppInsightsService>service);

            case ServiceTypes.Luis:
                return new LuisService(<ILuisService>service);

            case ServiceTypes.Endpoint:
                return new EndpointService(<IEndpointService>service);

            case ServiceTypes.AppInsights:
                return new AppInsightsService(<IAppInsightsService>service);

            case ServiceTypes.AzureStorage:
                return new AzureStorageService(<IAzureStorageService>service);

            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }

}

