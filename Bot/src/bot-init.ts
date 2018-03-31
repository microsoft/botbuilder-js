import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as program from 'commander';
import { BotConfig } from './BotConfig';
import * as readline from 'readline-sync';

interface InitArgs {
    id: string;
    name: string;
    appid: string;
    endpoint: string;
    localendpoint: string;
    quiet: boolean;
}

program
    .option('-n,--name <botname>', 'name of the bot')
    .option('-i,--id <id>', 'id of the bot')
    .option('--appid <appid>', 'MSA App Id of the bot')
    .option('--public <endpoint>', 'published endpoint for the bot')
    .option('--local <localendpoint>', 'local endpoint for the bot')
    .option('-q, --quiet', 'do not prompt')
    .action((name, x) => {
        console.log(name);
    });

let args: InitArgs = <InitArgs><any>program.parse(process.argv);

if (!args.quiet) {

    while (!args.hasOwnProperty("name") || args.name.length == 0) {
        args.name = readline.question(`What name would you like for your bot? `);
    }

    while (!args.id || args.id.trim().length == 0) {
        if (!args.hasOwnProperty("name")) {
            args.id = readline.question(`What id would you like for your bot? `);
        }
        else {
            let id = args.name.replace(' ', '');
            args.id = readline.question(`What id would you like for your bot [${id}]? `);
            if (args.id.length == 0)
                args.id = id;
        }
    }

    if (!args.appid) {
        args.appid = readline.question('What MSA App Id would you like for your bot? (enter to skip)');
    }

    if (!args.endpoint) {
        args.endpoint = readline.question('What published endpoint would you like for your bot? (enter to skip)');
    }

    if (!args.localendpoint) {
        args.localendpoint = readline.question('What local endpoint would you like for your bot? (enter to skip)');
    }
}

let bot = new BotConfig();
bot.name = args.name;
if (args.id.length > 0)
    bot.id = args.id;

if (args.appid.length > 0)
    bot.appId = args.appid;

if (args.localendpoint && args.localendpoint.length > 0)
    bot.endpoints.push({ name: 'local', url: args.localendpoint });

if (args.endpoint && args.endpoint.length > 0)
    bot.endpoints.push({ name: 'published', url: args.endpoint });

let filename = bot.name + '.bot';
bot.Save(filename);
console.log(`${filename} created`);
