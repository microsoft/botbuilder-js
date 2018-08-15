/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as crypto from 'crypto';
import * as fsx from 'fs-extra';
import { Enumerable, List } from 'linq-collections';
import * as path from 'path';
import * as process from 'process';
import * as txtfile from 'read-text-file';
import * as uuid from 'uuid';
import { decryptString, encryptString } from './encrypt';
import { AzureBotService, ConnectedService, DispatchService, EndpointService, FileService, LuisService, QnaMakerService } from './models';
import { IAzureBotService, IBotConfiguration, IConnectedService, IDispatchService, IEndpointService, IFileService, ILuisService, IQnAService, ServiceTypes } from './schema';


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
        let files = Enumerable.fromSource(await fsx.readdir(folder || process.cwd()))
            .where(file => path.extname(<string>file) == '.bot');

        if (files.any()) {
            return await BotConfiguration.load(<string>files.first(), secret);
        }
        throw new Error(`Error: no bot file found in ${folder}. Choose a different location or use msbot init to create a .bot file."`);
    }

    // load the config file
    public static async load(botpath: string, secret?: string): Promise<BotConfiguration> {
        let bot = BotConfiguration.fromJSON(JSON.parse(await txtfile.read(botpath)));
        bot.internal.location = botpath;

        let hasSecret = (bot.secretKey && bot.secretKey.length > 0);
        if (hasSecret)
            bot.decrypt(secret);

        return bot;
    }

    // save the config file
    public async save(botpath?: string, secret?: string): Promise<void> {
        if (!!secret) {
            this.validateSecretKey(secret);
        }

        let hasSecret = (this.secretKey && this.secretKey.length > 0);

        // make sure that all dispatch serviceIds still match services that are in the bot
        for (let service of this.services) {
            if (service.type == ServiceTypes.Dispatch) {
                let dispatchService = <IDispatchService>service;
                dispatchService.serviceIds = Enumerable.fromSource(dispatchService.serviceIds)
                    .where(serviceId => Enumerable.fromSource(this.services).any(s => s.id == serviceId))
                    .toArray();
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
        if (Enumerable.fromSource(this.services)
            .where(s => s.type == newService.type)
            .where(s => s.id == newService.id)
            .any()) {
            throw Error(`service with ${newService.id} already connected`);
        } else {
            // give unique name
            let nameCount = 1;
            let name = newService.name;

            while (true) {
                if (nameCount > 1) {
                    name = `${newService.name} (${nameCount})`;
                }

                if (!Enumerable.fromSource(this.services).where(s => s.name == name).any())
                    break;
                nameCount++;
            }
            newService.name = name;

            this.services.push(BotConfiguration.serviceFromJSON(newService));
        }
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
        this.validateSecretKey(secret);

        for (let service of this.services) {
            (<ConnectedService>service).decrypt(secret);
        }
    }


    // remove service by name or id
    public disconnectServiceByNameOrId(nameOrId: string): IConnectedService {
        let svs = new List<IConnectedService>(this.services);

        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.id == nameOrId || service.name == nameOrId) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return service;
            }
        }
        throw new Error(`a service with id or name of [${nameOrId}] was not found`);
    }

    // remove a service
    public disconnectService(type: string, id: string): void {
        let svs = new List<IConnectedService>(this.services);

        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.type == type && service.id == id) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return;
            }
        }
    }


    // make sure secret is correct by decrypting the secretKey with it
    public validateSecretKey(secret: string): void {
        if (!secret || secret.length == 0) {
            throw new Error('You are attempting to perform an operation which needs access to the secret and --secret is missing');
        }

        try {
            if (!this.secretKey || this.secretKey.length == 0) {
                // if no key, create a guid and enrypt that to use as secret validator
                this.secretKey = encryptString(uuid(), secret);
            } else {
                // validate we can decrypt the secretKey, this tells us we have the correct secret for the rest of the file.
                decryptString(this.secretKey, secret);
            }
        } catch {
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

            case ServiceTypes.AzureBotService:
                return new AzureBotService(<IAzureBotService>service);

            case ServiceTypes.Luis:
                return new LuisService(<ILuisService>service);

            case ServiceTypes.Endpoint:
                return new EndpointService(<IEndpointService>service);

            default:
                throw new TypeError(`${service.type} is not a known service implementation.`);
        }
    }

}

