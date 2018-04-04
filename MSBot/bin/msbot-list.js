"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const program = require("commander");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
program
    .name("msbot list")
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((cmd, actions) => {
});
let parsed = program.parse(process.argv);
if (!parsed.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
        .then(processListArgs)
        .catch((reason) => {
        console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
        program.help();
    });
}
else {
    BotConfig_1.BotConfig.Load(parsed.bot)
        .then(processListArgs)
        .catch((reason) => {
        console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
        program.help();
    });
}
async function processListArgs(config) {
    if (parsed.secret) {
        config.cryptoPassword = parsed.secret;
        for (let service of config.services) {
            for (var prop in service) {
                let val = service[prop];
                if (typeof val === "string") {
                    service[prop] = config.decryptValue(val);
                }
            }
        }
    }
    console.log(JSON.stringify(config.services, null, 4));
    return config;
}
//# sourceMappingURL=msbot-list.js.map