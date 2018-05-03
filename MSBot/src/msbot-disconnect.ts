/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as chalk from 'chalk';
import * as program from 'commander';
import { BotConfig } from './BotConfig';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};

interface DisconnectServiceArgs {
    bot: string;
    idOrName: string;
}

program
    .name('msbot disconnect')
    .arguments('<service_id_or_Name>')
    .description('disconnect a connected service by id or name')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .action((idOrName, actions) => {
        actions.idOrName = idOrName;
    });

let args = <DisconnectServiceArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    } else {
        BotConfig.Load(args.bot)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    }
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {
    if (!args.idOrName) {
        throw new Error('missing id or name of service to disconnect');
    }

    let removedService = config.disconnectServiceByNameOrId(args.idOrName);
    if (removedService != null) {
        await config.save();
        process.stdout.write(`Disconnected ${removedService.type}:${removedService.name} ${removedService.id}`);
    }

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