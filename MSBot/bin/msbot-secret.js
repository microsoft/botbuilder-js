"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require("chalk");
const program = require("commander");
const BotConfig_1 = require("./BotConfig");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    showErrorHelp();
};
program
    .name('msbot secret')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--secret <secret>', 'secret used to encrypt service keys')
    .option('-c, --clear', 'clear the secret and store keys unencrypted')
    .action((name, x) => {
    console.log(name);
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    showErrorHelp();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processSecret)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processSecret)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
}
async function processSecret(config) {
    config.validateSecretKey();
    if (args.clear) {
        config.clearSecret();
    }
    let filename = config.name + '.bot';
    config.save(filename);
    return config;
}
function showErrorHelp() {
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}
//# sourceMappingURL=msbot-secret.js.map