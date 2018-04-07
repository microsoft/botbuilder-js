"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const validurl = require("valid-url");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
const utils_1 = require("./utils");
program
    .name("msbot connect azure")
    .description('Connect the bot to Azure Bot Service')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-n, --name <name>', 'name of the azure bot service')
    .option('-a, --appId  <appid>', 'Microsoft AppId for the Azure Bot Service')
    .option('-p, --appPassword <password>', 'Microsoft app password for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', "endpoint for the bot using the MSA AppId")
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectAzureArgs(config) {
    if (!args.id)
        throw new Error("Bad or missing --id for registered bot");
    if (!args.appId || !utils_1.uuidValidate(args.appId))
        throw new Error("Bad or missing --appId");
    if (!args.appPassword)
        throw new Error("Bad or missing --appPassword");
    if (!args.endpoint)
        throw new Error("missing --endpoint");
    if (!validurl.isWebUri(args.endpoint))
        throw new Error(`--endpoint ${args.endpoint} is not a valid url`);
    config.connectService({
        type: BotConfig_1.ServiceType.AzureBotService,
        id: args.id,
        name: args.hasOwnProperty('name') ? args.name : args.id,
        appId: args.appId,
        appPassword: config.encryptValue(args.appPassword),
        endpoint: args.endpoint
    });
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-connect-azure.js.map