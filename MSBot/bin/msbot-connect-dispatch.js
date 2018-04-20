"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
const fs = require("fs-extra");
const getStdin = require("get-stdin");
const BotConfig_1 = require("./BotConfig");
const linq_collections_1 = require("linq-collections");
const utils_1 = require("./utils");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};
program
    .name("msbot connect dispatch")
    .description('Connect the bot to a dispatch model')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the dispatch')
    .option('-a, --appId <appid>', 'LUID AppId for the dispatch app')
    .option('-v, --version <version>', 'version for the dispatch app, (example: 0.1)')
    .option('--subscriptionKey <subscriptionKey>', 'subscription key used for querying the dispatch model')
    .option('--authoringKey <authoringkey>', 'authoring key for using manipulating the dispatch model via the LUIS authoring API')
    .option('--stdin', "arguments are passed in as JSON object via stdin")
    .option('--input <jsonfile>', "arguments passed in as path to arguments in JSON format")
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectDispatch)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectDispatch)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectDispatch(config) {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(args.input, 'utf8')));
    }
    if (!args.hasOwnProperty('name'))
        throw new Error("Bad or missing --name");
    if (!args.appId || !utils_1.uuidValidate(args.appId))
        throw new Error("bad or missing --appId");
    if (!args.version || parseInt(args.version) == 0)
        throw new Error("bad or missing --version");
    if (!args.authoringKey || !utils_1.uuidValidate(args.authoringKey))
        throw new Error("bad or missing --authoringKey");
    if (!args.subscriptionKey || !utils_1.uuidValidate(args.subscriptionKey))
        throw new Error("bad or missing --subscriptionKey");
    let dispatchService = {
        type: BotConfig_1.ServiceType.Dispatch,
        name: args.name,
        id: args.appId,
        appId: args.appId,
        version: args.version,
        subscriptionKey: args.subscriptionKey,
        authoringKey: args.authoringKey,
        serviceIds: []
    };
    let dispatchServices = args.services;
    if (dispatchServices) {
        for (let service of dispatchServices) {
            dispatchService.serviceIds.push(service.id || '');
            if (!linq_collections_1.Enumerable.fromSource(config.services).any(s => s.id == service.id)) {
                switch (service.type) {
                    case BotConfig_1.ServiceType.File:
                    case BotConfig_1.ServiceType.Luis:
                    case BotConfig_1.ServiceType.QnA:
                        config.connectService(service);
                        break;
                }
            }
        }
    }
    // add the service
    config.connectService(dispatchService);
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-connect-dispatch.js.map