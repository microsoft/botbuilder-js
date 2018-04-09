import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as program from 'commander';
import * as chalk from 'chalk';
import { BotConfig, ServiceType } from './BotConfig';
import * as readline from 'readline-sync';
import { IConnectedService, ILuisService, IDispatchService, IAzureBotService, IBotConfig, IEndpointService, IQnAService } from './schema';

interface InitArgs {
    name: string;
    description: string;
    secret: string;
    endpoint: string;
    quiet: boolean;
}

program
    .name("msbot init")
    .option('--secret <secret>', 'secret used to encrypt service keys')
    .option('-n, --name <botname>', 'name of the bot')
    .option('-d, --description <description>', 'description of the bot')
    .option('-e, --endpoint <endpoint>', 'local endpoint for the bot')
    .option('-q, --quiet', 'do not prompt')
    .action((name, x) => {
        console.log(name);
    });

let args: InitArgs = <InitArgs><any>program.parse(process.argv);

if (!args.quiet) {

    while (!args.hasOwnProperty("name") || args.name.length == 0) {
        args.name = readline.question(`What name would you like for your bot? `);
    }

    while (!args.secret || args.secret.length == 0) {
        args.secret = readline.question(`What secret would you like to use to secure your keys? `);
    }

    if (!args.description || args.description.length == 0) {
        args.description = readline.question(`What description would you like for your bot? `);
    }

    while (!args.endpoint || args.endpoint.length == 0) {
        args.endpoint = readline.question(`What localhost endpoint does your bot use for debugging [Example: http://localhost:3978/api/messages]? `, {
            defaultInput: `http://localhost:3978/api/messages`
        });
    }
}

if (!args.name) {
    console.error('missing --name argument');
} else if (!args.secret) {
    console.error('missing --secret argument');
}
else {
    let bot = new BotConfig(args.secret);
    bot.name = args.name;
    bot.description = args.description;
    bot.validateSecretKey();
    
    bot.connectService(<IEndpointService>{
        type: ServiceType.Endpoint,
        name: args.name,
        endpoint: args.endpoint,
        description: args.description,
        id: args.endpoint,
        appId: '',
        appPassword: ''
    });

    let filename = bot.name + '.bot';
    bot.Save(filename);
    console.log(`${filename} created`);

}
