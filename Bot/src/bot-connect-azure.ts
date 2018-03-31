import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as program from 'commander';
import { BotConfig } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectAzureArgs {
    bot: string;
    id: string;
    name: string;
    appid: string;
    endpoint: string;
}

program
    .command('azure', 'connect to Azure Bot Service')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-n, --name <botname>', "name of the azure bot service")
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-a, --appid <appid>', 'Microsoft AppId for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', 'endpoint of the azure bot service')
    .action((cmd, actions) => {

    });

let args = <ConnectAzureArgs><any>program.parse(process.argv);

async function connectService(config: BotConfig): Promise<BotConfig> {
    args.name = args.name;

    // get azure services which have the same appid
    let service = Enumerable.fromSource(config.services)
        .where(s => s.type == 'azure')
        .select(s => <IAzureBotService>s)
        .where(s => s.appid == args.appid)
        .firstOrDefault();

    if (service) {
        throw Error(`Azure Bot Service with appid:${args.appid} already connected`);
    } else {
        config.services.push(<IAzureBotService>{
            type: 'azure',
            id: config.id,
            appid: args.appid,
            name: args.name || config.name
        });
    }

    let endpoint = Enumerable.fromSource(config.endpoints)
        .where(ep => ep.url == args.endpoint)
        .firstOrDefault();

    if (endpoint) {
        throw Error(`endpoint:${args.endpoint} already connected`);
    }
    else {
        config.endpoints.push(<IBotEndpoint>{
            name: args.name || args.endpoint,
            url: args.endpoint
        });

        config.Save();
    }

    return config;
}

if (!args.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(connectService)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(args.bot)
        .then(connectService)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

