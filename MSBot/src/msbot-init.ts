import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as program from 'commander';
import { BotConfig, ServiceType } from './BotConfig';
import * as readline from 'readline-sync';

interface InitArgs {
    name: string;
    description: string;
    endpoint: string;
    quiet: boolean;
}

program
    .option('-n, --name <botname>', 'name of the bot')
    .option('-d, --description <description>', 'description of the bot')
    .option('-e, --endpoint <endpoint>', 'local endpoint for the bot', parseInt)
    .option('-q, --quiet', 'do not prompt')
    .action((name, x) => {
        console.log(name);
    });

let args: InitArgs = <InitArgs><any>program.parse(process.argv);

if (!args.quiet) {

    while (!args.hasOwnProperty("name") || args.name.length == 0) {
        args.name = readline.question(`What name would you like for your bot? `);
    }

    if (!args.description || args.description.length == 0) {
        args.description = readline.question(`What description would you like for your bot? `);
    }

    while (!args.endpoint) {
        args.endpoint = readline.question(`What localhost endpoint does your bot use for debugging [Example: http://localhost:3978/api/messages]? `, {
            defaultInput: `http://localhost:3978/api/messages`
        });
    }
}

let bot = new BotConfig();
bot.name = args.name;
bot.description = args.description;

bot.connectService(<ILocalhostService>{
    type: ServiceType.Localhost,
    endpoint: args.endpoint,
    name: args.name,
    id: '',
    appId: '',
    appPassword: ''
});

let filename = bot.name + '.bot';
bot.Save(filename);
console.log(`${filename} created`);
