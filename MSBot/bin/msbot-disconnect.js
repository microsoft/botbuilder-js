"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};
program
    .name("msbot disconnect")
    .arguments("<service_id_or_Name>")
    .description("disconnect a connected service by id or name")
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .action((idOrName, actions) => {
    actions.idOrName = idOrName;
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectAzureArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot)
            .then(processConnectAzureArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectAzureArgs(config) {
    if (!args.idOrName) {
        throw new Error("missing id or name of service to disconnect");
    }
    config.disconnectServiceByNameOrId(args.idOrName);
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-disconnect.js.map