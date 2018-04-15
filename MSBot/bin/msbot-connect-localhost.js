"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const validurl = require("valid-url");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
program
    .name("msbot connect localhost")
    .description('Connect the bot to localhost endpoint')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
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
            .then(processConnectEndpointArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectEndpointArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectEndpointArgs(config) {
    if (!args.endpoint)
        throw new Error("missing endpoint");
    if (!validurl.isWebUri(args.endpoint)) {
        throw new Error(`${args.endpoint} is not a valid url`);
    }
    let id = `${args.appId}${args.endpoint}`;
    let hasCredentials = (args.appId && args.appPassword && args.appId.length > 0 && args.appPassword.length > 0);
    let credentialLabel = (hasCredentials) ? ' with AppID' : '';
    config.connectService({
        type: BotConfig_1.ServiceType.Localhost,
        id: id,
        name: args.hasOwnProperty('name') ? args.name : `${args.endpoint}${credentialLabel}`,
        appId: (args.appId && args.appId.length > 0) ? args.appId : null,
        appPassword: (args.appPassword && args.appPassword.length > 0) ? config.encryptValue(args.appPassword) : null,
        endpoint: args.endpoint
    });
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-connect-localhost.js.map