import * as os from 'os';
import * as process from 'process';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as program from 'commander';
import { BotConfig } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface EndpointArgs {
    bot: string;
    list: boolean;
    url: string;
    remove: boolean;
    name: string;
}

program
    .arguments('[url]')
    .description('add or remove an endpoint url for the bot')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-r, --remove', "remove endpoint url")
    .option('-l, --list', "list endpoints")
    .option('-n, --name <name>', "name of endpoint")
    .action((cmd, actions) => {
        actions.url = cmd;
    });

let endpointArgs = <EndpointArgs><any>program.parse(process.argv);

if (!endpointArgs || !endpointArgs.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(processEndpointArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(endpointArgs.bot)
        .then(processEndpointArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

async function processEndpointArgs(botConfig: BotConfig): Promise<BotConfig> {
    let endpoints = new List<IBotEndpoint>(botConfig.endpoints);
    if (endpointArgs.list) {
        console.log(JSON.stringify(botConfig.endpoints, null, 4));
    }
    else if (endpointArgs.remove) {
        botConfig.removeEndpoint(endpointArgs.url || endpointArgs.name);
        botConfig.Save();
    }
    else {
        botConfig.addEndpoint(endpointArgs.url, endpointArgs.name);
        botConfig.Save();
    }

    return botConfig;
}
