import * as process from 'process';
import * as url from 'url';
import * as validurl from 'valid-url';
import * as path from 'path';
import * as fsx from 'fs-extra';
import { Enumerable, List, Dictionary } from 'linq-collections';

export enum ServiceType {
    Luis = "luis",
    QnA = "qna"
}

export class BotConfig implements IBotConfig {
    private location: string;

    id: string = '';
    appid: string = '';
    name: string = '';
    description: string = '';
    endpoints: IBotEndpoint[] = [];
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
            id: this.id,
            name: this.name,
            description: this.description,
            appid: this.appid,
            endpoints: this.endpoints,
            services: this.services
        }, { spaces: 4 });
    }

    public addService(newService: IConnectedService): void {
        if (Enumerable.fromSource(this.services)
            .where(s => s.type == newService.type)
            .where(s => s.id == newService.id)
            .any()) {
            throw Error(`Azure Bot Service with appid:${newService.id} already connected`);
        } else {
            this.services.push(newService);
        }
    }

    public removeServiceByNameOrId(nameOrId: string): void {
        let svs = new List<IConnectedService>(this.services);

        for (let i = 0; i < svs.count(); i++) {
            let service = svs.elementAt(i);
            if (service.id == nameOrId || service.name == nameOrId) {
                svs.removeAt(i);
                this.services = svs.toArray();
                return;
            }
        }
        throw new Error(`a service with id or name of ${nameOrId} was not found`);
    }

    public removeService(type: string, id: string): void {
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

    public addEndpoint(endpointUrl: string, name?: string): void {
        let endpoints = new List<IBotEndpoint>(this.endpoints);

        if (endpoints.where(ep => ep.url == endpointUrl).any()) {
            // already in there
            return;
        }

        if (!validurl.isWebUri(endpointUrl)) {
            throw new Error(`${endpointUrl} is not a valid url`);
        }
        let endpoint = {
            name: name || url.parse(endpointUrl).hostname || endpointUrl,
            url: endpointUrl
        };

        this.endpoints.push(endpoint);
    }

    public removeEndpoint(nameOrUrl: string) {
        let eps = new List<IBotEndpoint>(this.endpoints);
        for (let i = 0; i < this.endpoints.length; i++) {
            let endpoint = eps.elementAt(i);
            if (endpoint.name == nameOrUrl || endpoint.url == nameOrUrl) {
                eps.removeAt(i);
                this.endpoints = eps.toArray();
                return;
            }
        }
    }
}

