/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as chalk from 'chalk';
import * as program from 'commander';
import { BotConfig } from './BotConfig';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    showErrorHelp();
};

interface SecretArgs {
    bot: string;
    secret: string;
    endpoint: string;
    clear: boolean;
}

program
    .name('msbot secret')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--secret <secret>', 'secret used to encrypt service keys')
    .option('-c, --clear', 'clear the secret and store keys unencrypted')
    .action((name, x) => {
        console.log(name);
    });

let args: SecretArgs = <SecretArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    showErrorHelp();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processSecret)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processSecret)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    }
}

async function processSecret(config: BotConfig): Promise<BotConfig> {
    config.validateSecretKey();
    if (args.clear) {
        config.clearSecret();
    }


    let filename = config.name + '.bot';
    config.save(filename);
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