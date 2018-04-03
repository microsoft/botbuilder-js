import * as process from 'process';
import * as crypto from 'crypto';
import * as url from 'url';
import * as validurl from 'valid-url';
import * as path from 'path';
import * as fsx from 'fs-extra';
import { Enumerable, List, Dictionary } from 'linq-collections';

export enum ServiceType {
    Localhost = "localhost",
    AzureBotService = "abs",
    Luis = "luis",
    QnA = "qna"
}

export class BotConfig implements IBotConfig {
    private location: string;
    // not saved
    cryptoPassword: string;

    name: string = '';
    description: string = '';
    services: IConnectedService[] = [];


    constructor() {
    }

    public static async LoadBotFromFolder(folder?: string): Promise<BotConfig> {
        let files = Enumerable.fromSource(await fsx.readdir(folder || process.cwd()))
            .where(file => path.extname(file) == '.bot');

        if (files.any()) {
            return await BotConfig.Load(files.first());
        }
        throw new Error(`no bot file found in ${folder}`);
    }

    // load the config file
    public static async Load(botpath: string): Promise<BotConfig> {
        let bot = new BotConfig();
        Object.assign(bot, await fsx.readJson(botpath));
        bot.location = botpath;
        return bot;
    }

    // save the config file
    public async Save(botpath?: string): Promise<void> {
        await fsx.writeJson(botpath || this.location, <IBotConfig>{
            name: this.name,
            description: this.description,
            services: this.services
        }, { spaces: 4 });
    }

    // connect to a service
    public connectService(newService: IConnectedService): void {
        if (Enumerable.fromSource(this.services)
            .where(s => s.type == newService.type)
            .where(s => s.id == newService.id)
            .any()) {
            throw Error(`Azure Bot Service with appid:${newService.id} already connected`);
        } else {
            this.services.push(newService);
        }
    }

    // remove service by name or id
    public disconnectServiceByNameOrId(nameOrId: string): void {
        let svs = new List<IConnectedService>(this.services);

        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.id == nameOrId || service.name == nameOrId) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return;
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
    public static boundary: string = '~^~';

    public encryptValue(value: string): string {
        if (!value)
            return value;

        if (!this.cryptoPassword || this.cryptoPassword.length == 0) {
            throw new Error("You are attempting to store a value which needs to be encrypted and --secret is not set.  Pass --secret to encrypt/decrypt resource keys.");
        }

        var cipher = crypto.createCipher('aes192', this.cryptoPassword);
        var encryptedValue = cipher.update(value, 'utf8', 'hex');
        encryptedValue += cipher.final('hex');
        return `${BotConfig.boundary}${encryptedValue}${BotConfig.boundary}`;
    }

    public decryptValue(encryptedValue: string): string {
        if (!this.cryptoPassword || this.cryptoPassword.length == 0) {
            throw new Error("No password is set");
        }
        if (encryptedValue.startsWith(BotConfig.boundary) && encryptedValue.endsWith(BotConfig.boundary)) {
            const decipher = crypto.createDecipher('aes192', this.cryptoPassword);
            let value = decipher.update(encryptedValue.substring(3, encryptedValue.length - 3), 'hex', 'utf8');
            value += decipher.final('utf8');
            return value;
        }
        return encryptedValue;
    }
}

