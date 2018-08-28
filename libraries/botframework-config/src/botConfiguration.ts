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
import {
    AppInsightsService,
    BlobStorageService,
    BotService,
    ConnectedService,
    CosmosDbService,
    DispatchService,
    EndpointService,
    FileService,
    GenericService,
    LuisService,
    QnaMakerService
} from './models';
import {
    IAppInsightsService,
    IBlobStorageService,
    IBotConfiguration,
    IBotService,
    IConnectedService,
    ICosmosDBService,
    IDispatchService,
    IEndpointService,
    IFileService,
    IGenericService,
    ILuisService,
    IQnAService,
    ServiceTypes
} from './schema';

interface InternalBotConfig {
    location?: string;
}

export class BotConfiguration implements Partial<IBotConfiguration> {

    public name: string = '';
    public description: string = '';
    public services: IConnectedService[] = [];
    public secretKey: string = '';
    public version: string = '2.0';

    // internal is not serialized
    private internal: InternalBotConfig = {};

    constructor() {
        // noop
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

    // load first bot in a folder
    public static async loadBotFromFolder(folder?: string, secret?: string): Promise<BotConfiguration> {
        folder = folder || process.cwd();
        let files: string[] = await fsx.readdir(folder);
        files = files.sort();
        for (const file of files) {
            if (path.extname(<string>file) === '.bot') {
                // tslint:disable-next-line:prefer-template
                return await BotConfiguration.load(folder + '/' + <string>file, secret);
            }
        }
        throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
    }

    // load first bot in a folder (blocking)
    public static loadBotFromFolderSync(folder?: string, secret?: string): BotConfiguration {
        folder = folder || process.cwd();
        let files: string[] = fsx.readdirSync(folder);
        files = files.sort();
        for (const file of files) {
            if (path.extname(<string>file) === '.bot') {
                // tslint:disable-next-line:prefer-template
                return BotConfiguration.loadSync(folder + '/' + <string>file, secret);
            }
        }
        throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
    }

    // load the config from a file
    public static async load(botpath: string, secret?: string): Promise<BotConfiguration> {
        const json: string = await txtfile.read(botpath);
        const bot: BotConfiguration = BotConfiguration._load(json, secret);
        bot.internal.location = botpath;

        return bot;
    }

    // load the config from a file (blocking)
    public static loadSync(botpath: string, secret?: string): BotConfiguration {
        const json: string = txtfile.readSync(botpath);
        const bot: BotConfiguration = BotConfiguration._load(json, secret);
        bot.internal.location = botpath;

        return bot;
    }

    public static fromJSON(source: Partial<IBotConfiguration> = {}): BotConfiguration {
        // tslint:disable-next-line:prefer-const
        let { name = '', description = '', version = '2.0', secretKey = '', services = [] } = source;
        services = services.slice().map(BotConfiguration.serviceFromJSON);
        const botConfig: BotConfiguration = new BotConfiguration();
        Object.assign(botConfig, { services, description, name, version, secretKey });

        return botConfig;
    }

    // Generate a key for encryption
    public static generateKey(): string {
        return encrypt.generateKey();
    }

    private static _load(json: string, secret?: string): BotConfiguration {
        const bot: BotConfiguration = BotConfiguration.fromJSON(JSON.parse(json));

        const hasSecret: boolean = !!bot.secretKey;
        if (hasSecret) {
            bot.decrypt(secret);
        }

        return bot;
    }

    public clearSecret(): void {
        this.secretKey = '';
    }

    // connect to a service
    // returns assignd id for the service
    public connectService(newService: IConnectedService): string {
        const service: ConnectedService = BotConfiguration.serviceFromJSON(newService);

        // assign a unique id
        let found: boolean = false;
        do {
            found = false;
            service.id = Math.floor((Math.random() * 255)).toString();
            for (const existingService of this.services) {
                if (existingService.id === service.id) {
                    found = true;
                    break;
                }
            }
        } while (found);

        this.services.push(service);

        return service.id;
    }

    public toJSON(): Partial<IBotConfiguration> {
        const { name, description, version, secretKey, services } = this;

        return { name, description, version, secretKey, services };
    }

    // save the config file to specificed botpath
    public async saveAs(botpath: string, secret?: string): Promise<void> {
        if (!botpath) {
            throw new Error(`missing path`);
        }

        this._savePrep(secret);

        const hasSecret: boolean = !!this.secretKey;

        if (hasSecret) {
            this.encrypt(secret);
        }
        await fsx.writeJson(botpath, this.toJSON(), { spaces: 4 });

        if (hasSecret) {
            this.decrypt(secret);
        }
    }

    // save the config file to specificed botpath
    public saveAsSync(botpath: string, secret?: string): void {
        this._savePrep(secret);

        const hasSecret: boolean = !!this.secretKey;

        if (hasSecret) {
            this.encrypt(secret);
        }

        fsx.writeJsonSync(botpath, this.toJSON(), { spaces: 4 });

        if (hasSecret) {
            this.decrypt(secret);
        }
    }

    // save the config file back over original
    public async save(secret?: string): Promise<void> {
        return this.saveAs(this.internal.location, secret);
    }

    // save the config file back over original (blocking)
    public saveSync(secret?: string): void {
        return this.saveAsSync(this.internal.location, secret);
    }

    // encrypt all values in the config
    public encrypt(secret: string): void {
        this.validateSecretKey(secret);

        for (const service of this.services) {
            (<ConnectedService>service).encrypt(secret);
        }
    }

    // decrypt all values in the config
    public decrypt(secret?: string): void {
        try {
            this.validateSecretKey(secret);

            for (const connected_service of this.services) {
                (<ConnectedService>connected_service).decrypt(secret);
            }
        } catch (err) {
            try {

                // legacy decryption
                this.secretKey = this.legacyDecrypt(this.secretKey, secret);
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
                        (<any>service)[prop] = this.legacyDecrypt(val, secret);
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
                        for (let i: number = 0; i < dispatch.serviceIds.length; i++) {
                            dispatch.serviceIds[i] = map[dispatch.serviceIds[i]];
                        }
                    }
                }

            } catch (decrypt_error) {
                throw decrypt_error;
            }

            // return service;
        }
    }

    // return the path that this config was loaded from.  .save() will save to this path
    public getPath() : string {
        return this.internal.location;
    }

    // find a service by id
    public findService(id: string): IConnectedService {
        for (const service of this.services) {
            if (service.id === id) {
                return service;
            }
        }

        return null;
    }

    // find a service by name or id (checks ids first)
    public findServiceByNameOrId(nameOrId: string): IConnectedService {
        for (const service of this.services) {
            if (service.id === nameOrId) {
                return service;
            }
        }

        for (const service of this.services) {
            if (service.name === nameOrId) {
                return service;
            }
        }

        return null;
    }

    // remove service by name or id
    public disconnectServiceByNameOrId(nameOrId: string): IConnectedService {
        const { services = [] } = this;
        let i: number = services.length;
        while (i--) {
            const service: IConnectedService = services[i];
            if (service.id === nameOrId || service.name === nameOrId) {
                return services.splice(i, 1)[0];
            }
        }
        throw new Error(`a service with id or name of [${nameOrId}] was not found`);
    }

    // remove a service
    public disconnectService(id: string): void {
        const { services = [] } = this;
        let i: number = services.length;
        while (i--) {
            const service: IConnectedService = services[i];
            if (service.id === id) {
                services.splice(i, 1); // TODO: What is the purpose of this? Previously services.splice(i,1)[0]; <-- why have array access?

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
            if (!this.secretKey || this.secretKey.length === 0) {
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

    private _savePrep(secret?: string): void {
        if (!!secret) {
            this.validateSecretKey(secret);
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

    private legacyDecrypt(encryptedValue: string, secret: string): string {
        // LEGACY for pre standardized SHA256 encryption, this uses some undocumented nodejs MD5 hash internally and is deprecated
        const decipher: crypto.Decipher = crypto.createDecipher('aes192', secret);
        let value: string = decipher.update(encryptedValue, 'hex', 'utf8');
        value += decipher.final('utf8');

        return value;
    }
}
