"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const program = require("commander");
const fs = require("fs-extra");
const getStdin = require("get-stdin");
const BotConfig_1 = require("./BotConfig");
const models_1 = require("./models");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};
program
    .name('msbot connect azure')
    .description('Connect the bot to Azure Bot Service')
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-a, --appId  <appid>', 'Microsoft AppId for the Azure Bot Service\n')
    .option('-n, --name <name>', '(OPTIONAL) name of the azure bot service')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--input <jsonfile>', 'path to arguments in JSON format { id:\'\',name:\'\', ... }')
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('--stdin', 'arguments are passed in as JSON object via stdin')
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
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            program.help();
        });
    }
}
async function processConnectAzureArgs(config) {
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(args.input, 'utf8')));
    }
    if (!args.id)
        throw new Error('Bad or missing --id for registered bot');
    if (!args.appId || !utils_1.uuidValidate(args.appId))
        throw new Error('Bad or missing --appId');
    let service = new models_1.AzureBotService({
        type: schema_1.ServiceType.AzureBotService,
        id: args.id,
        name: args.hasOwnProperty('name') ? args.name : args.id,
        appId: args.appId
    });
    config.connectService(service);
    await config.save();
    process.stdout.write(`Connected ${service.type}:${service.name} ${service.id}`);
    return config;
}
//# sourceMappingURL=msbot-connect-azure.js.map