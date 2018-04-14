"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const program = require("commander");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .name("msbot list")
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((cmd, actions) => {
});
let parsed = program.parse(process.argv);
if (!parsed.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), parsed.secret)
        .then(processListArgs)
        .catch((reason) => {
        console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
        program.help();
    });
}
else {
    BotConfig_1.BotConfig.Load(parsed.bot, parsed.secret)
        .then(processListArgs)
        .catch((reason) => {
        console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
        program.help();
    });
}
async function processListArgs(config) {
    let services = config.services;
    if (parsed.secret) {
        config.decryptAll();
    }
<<<<<<< HEAD
    console.log(JSON.stringify(config, null, 4));
=======
    console.log(JSON.stringify({
        name: config.name,
        description: config.description,
        services: config.services
    }, null, 4));
>>>>>>> master
    return config;
}
//# sourceMappingURL=msbot-list.js.map