/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as chalk from 'chalk';
import * as program from 'commander';
import * as path from 'path';
import { BotConfig } from './BotConfig';
import { FileService } from './models/fileService';
import { IFileService, ServiceType } from './schema';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};

interface ConnectFileArgs extends IFileService {
    bot: string;
    secret: string;
}

program
    .name('msbot connect file <path>')
    .description('Connect a file to the bot')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((filePath, actions) => {
        if (filePath)
            actions.filePath = filePath;
    });

let args = <ConnectFileArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectFile)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectFile)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    }
}

async function processConnectFile(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (!args.hasOwnProperty('filePath'))
        throw new Error('Bad or missing file');

    // add the service
    let newService = new FileService({
        id: args.filePath,
        name: path.basename(args.filePath),
        filePath: args.filePath
    } as IFileService);
    config.connectService(newService);
    await config.save();
    process.stdout.write(JSON.stringify(newService, null, 2));
    return config;
}

function showErrorHelp()
{
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}