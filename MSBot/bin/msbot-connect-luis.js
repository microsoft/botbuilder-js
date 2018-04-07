"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
const utils_1 = require("./utils");
program
    .name("msbot connect luis")
    .description('Connect the bot to a LUIS application')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appId <appid>', 'AppId for the LUIS App')
    .option('-v, --version <version>', 'version for the LUIS App, (example: v0.1)')
    .option('--subscriptionKey <subscriptionKey>', 'subscription key used for querying a LUIS model')
    .option('--authoringKey <authoringkey>', 'authoring key for using manipulating LUIS apps via the authoring API')
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectLuisArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectLuisArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectLuisArgs(config) {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;
    if (!args.hasOwnProperty('name'))
        throw new Error("Bad or missing name");
    if (!args.appId || !utils_1.uuidValidate(args.appId))
        throw new Error("bad or missing --appId");
    if (!args.version || parseInt(args.version))
        throw new Error("bad or missing --version");
    if (!args.authoringKey || !utils_1.uuidValidate(args.authoringKey))
        throw new Error("bad or missing --authoringKey");
    if (!args.subscriptionKey || !utils_1.uuidValidate(args.subscriptionKey))
        throw new Error("bad or missing --subscriptionKey");
    // add the service
    config.connectService({
        type: BotConfig_1.ServiceType.Luis,
        name: args.name,
        id: args.appId,
        appId: args.appId,
        version: args.version,
        subscriptionKey: config.encryptValue(args.subscriptionKey),
        authoringKey: config.encryptValue(args.authoringKey)
    });
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-connect-luis.js.map