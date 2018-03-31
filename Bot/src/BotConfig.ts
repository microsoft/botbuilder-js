import * as process from 'process';
import * as path from 'path';
import * as fsx from 'fs-extra';
import { Enumerable, List, Dictionary } from 'linq-collections';

export class BotConfig implements IBotConfig {
    private location: string;

    id: string = '';
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
            endpoints: this.endpoints,
            services: this.services
        }, { spaces: 4 });
    }
}

