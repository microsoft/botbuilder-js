import * as path from 'path';
import * as fsx from 'fs-extra';
import { Enumerable, List, Dictionary } from 'linq-collections';

export class BotConfig implements Bot {
    name: string = '';
    id: string = '';
    endpoints: BotEndpoint[] = [];
    services: ConnectedService[] = [];

    constructor() {
    }

    public static async FindBot(folderpath: string): Promise<BotConfig> {
        let files = Enumerable.fromSource(await fsx.readdir(folderpath))
            .where(file => path.extname(file) == '.bot');

        if (files.any()) {
            return await BotConfig.Load(files.first());
        }
        throw new Error(`no bot file found in ${folderpath}`);
    }

    // load the config file
    public static async Load(path: string): Promise<BotConfig> {
        let bot = new BotConfig();
        Object.assign(bot, await fsx.readJson(path));
        return bot;
    }

    // save the config file
    public Save(path: string): Promise<void> {
        return fsx.writeJson(path, this, { spaces: 4 });
    }
}
