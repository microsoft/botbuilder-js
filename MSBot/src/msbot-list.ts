import * as os from 'os';
import * as process from 'process';
import * as table2 from 'cli-table2';
import * as path from 'path';
import * as program from 'commander';
import { BotConfig } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ListArgs {
    bot: string;
    secret: string;
}

program
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((cmd, actions) => {
    });

let parsed = <ListArgs><any>program.parse(process.argv);

if (!parsed.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(processListArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(parsed.bot)
        .then(processListArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

async function processListArgs(config: BotConfig): Promise<BotConfig> {
    console.log(JSON.stringify(config.services, null, 4));
    return config;
}
