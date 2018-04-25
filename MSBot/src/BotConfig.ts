import * as process from 'process';
import * as uuid from 'uuid';
import * as crypto from 'crypto';
import * as url from 'url';
import * as validurl from 'valid-url';
import * as path from 'path';
import * as fsx from 'fs-extra';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { encode } from 'punycode';
import { IBotConfig, IConnectedService, IDispatchService } from './schema';

export enum ServiceType {
    Endpoint = "endpoint",
    AzureBotService = "abs",
    Luis = "luis",
    QnA = "qna",
    Dispatch = 'dispatch',
    File = "file"
}

interface internalBotConfig {
    location?: string;
    secret?: string;
    secretValidated: boolean;
}

export class BotConfig implements IBotConfig {
    // internal is not serialized
    private internal: internalBotConfig = {
        secretValidated: false
    };

    protected encryptedProperties: { [key: string]: string[]; } = {
        endpoint: ['appPassword'],
        abs: ['appPassword'],
        luis: ['authoringKey', 'subscriptionKey'],
        qna: ['subscriptionKey'],
        dispatch: ['authoringKey', 'subscriptionKey']
    };

    public name: string = '';
    public secretKey: string = '';
    public description: string = '';
    public services: IConnectedService[] = [];

    constructor(secret?: string) {
        this.internal.secret = secret;
    }

    public static async LoadBotFromFolder(folder?: string, secret?: string): Promise<BotConfig> {
        let files = Enumerable.fromSource(await fsx.readdir(folder || process.cwd()))
            .where(file => path.extname(<string>file) == '.bot');

        if (files.any()) {
            return await BotConfig.Load(<string>files.first(), secret);
        }
        throw new Error(`no bot file found in ${folder}`);
    }

    // load the config file
    public static async Load(botpath: string, secret?: string): Promise<BotConfig> {
        let bot = new BotConfig(secret);
        Object.assign(bot, await fsx.readJson(botpath));
        bot.internal.location = botpath;

        let hasSecret = (secret && bot.secretKey && bot.secretKey.length > 0);
        if (hasSecret)
            bot.decryptAll();

        return bot;
    }

    // save the config file
    public async Save(botpath?: string): Promise<void> {
        let hasSecret = (this.secretKey && this.secretKey.length > 0);

        // make sure that all dispatch serviceIds still match services that are in the bot
        for (let service of this.services) {
            if (service.type == ServiceType.Dispatch) {
                let dispatchService = <IDispatchService>service;
                dispatchService.serviceIds = Enumerable.fromSource(dispatchService.serviceIds)
                    .where(serviceId => Enumerable.fromSource(this.services).any(s => s.id == serviceId))
                    .toArray();
            }
        }
        
        if (hasSecret)
            this.encryptAll();

        await fsx.writeJson(botpath || <string>this.internal.location, <IBotConfig>{
            name: this.name,
            description: this.description,
            secretKey: this.secretKey,
            services: this.services
        }, { spaces: 4 });

        if (hasSecret)
            this.decryptAll();
    }

    public clearSecret() {
        this.validateSecretKey();
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

            this.services.push(newService);
        }
    }

    // encrypt all values in the config
    public encryptAll() {
        for (let service of this.services) {
            this.encryptService(service);
        }
    }

    // decrypt all values in the config
    public decryptAll() {
        for (let service of this.services) {
            this.decryptService(service);
        }
    }

    // encrypt just a service
    private encryptService(service: IConnectedService): IConnectedService {
        let encryptedProperties = this.getEncryptedProperties(<ServiceType>service.type);
        for (let i = 0; i < encryptedProperties.length; i++) {
            let prop = encryptedProperties[i];
            let val = <string>(<any>service)[prop];
            (<any>service)[prop] = this.encryptValue(val);
        }
        return service;
    }

    // decrypt just a service
    private decryptService(service: IConnectedService): IConnectedService {
        let encryptedProperties = this.getEncryptedProperties(<ServiceType>service.type);
        for (let i = 0; i < encryptedProperties.length; i++) {
            let prop = encryptedProperties[i];
            let val = <string>(<any>service)[prop];
            (<any>service)[prop] = this.decryptValue(val);
        }
        return service;
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

    public encryptValue(value: string): string {
        if (!value || value.length == 0)
            return value;

        if (this.secretKey.length > 0) {
            this.validateSecretKey();

            return this.internalEncrypt(value);
        }
        return value;
    }

    public decryptValue(encryptedValue: string): string {
        if (!encryptedValue || encryptedValue.length == 0)
            return encryptedValue;

        if (this.secretKey.length > 0) {
            this.validateSecretKey();

            return this.internalDecrypt(encryptedValue);
        }
        return encryptedValue;
    }


    // make sure secret is correct by decrypting the secretKey with it
    public validateSecretKey(): void {
        if (this.internal.secretValidated) {
            return;
        }

        if (!this.internal.secret || this.internal.secret.length == 0) {
            throw new Error("You are attempting to perform an operation which needs access to the secret and --secret is missing");
        }

        try {
            if (!this.secretKey || this.secretKey.length == 0) {
                // if no key, create a guid and enrypt that to use as secret validator
                this.secretKey = this.internalEncrypt(uuid());
            } else {
                const decipher = crypto.createDecipher('aes192', this.internal.secret);
                let value = decipher.update(this.secretKey, 'hex', 'utf8');
                value += decipher.final('utf8');
            }

            this.internal.secretValidated = true;
        } catch{
            throw new Error("You are attempting to perform an operation which needs access to the secret and --secret is incorrect.");
        }
    }

    private internalEncrypt(value: string): string {
        var cipher = crypto.createCipher('aes192', this.internal.secret);
        var encryptedValue = cipher.update(value, 'utf8', 'hex');
        encryptedValue += cipher.final('hex');
        return encryptedValue;
    }

    private internalDecrypt(encryptedValue: string): string {
        const decipher = crypto.createDecipher('aes192', this.internal.secret);
        let value = decipher.update(encryptedValue, 'hex', 'utf8');
        value += decipher.final('utf8');
        return value;
    }

    public getEncryptedProperties(type: ServiceType): string[] {
        return this.encryptedProperties[<string>type];
    }
}

