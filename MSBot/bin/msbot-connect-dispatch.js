"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require("chalk");
const program = require("commander");
const getStdin = require("get-stdin");
const txtfile = require("read-text-file");
const linq_collections_1 = require("linq-collections");
const BotConfig_1 = require("./BotConfig");
const models_1 = require("./models");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};
program
    .name('msbot connect dispatch')
    .description('Connect the bot to a dispatch model')
    .option('-n, --name <name>', 'name for the dispatch')
    .option('-a, --appId <appid>', 'LUID AppId for the dispatch app')
    .option('-v, --version <version>', 'version for the dispatch app, (example: 0.1)')
    .option('--authoringKey <authoringkey>', 'authoring key for using manipulating the dispatch model via the LUIS authoring API\n')
    .option('--subscriptionKey <subscriptionKey>', '(OPTIONAL) subscription key used for querying the dispatch model')
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
            .then(processConnectDispatch)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectDispatch)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
}
async function processConnectDispatch(config) {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(await txtfile.read(args.input)));
    }
    if (!args.hasOwnProperty('name'))
        throw new Error('Bad or missing --name');
    if (!args.appId || !utils_1.uuidValidate(args.appId))
        throw new Error('bad or missing --appId');
    if (!args.version)
        throw new Error('bad or missing --version');
    if (!args.authoringKey || !utils_1.uuidValidate(args.authoringKey))
        throw new Error('bad or missing --authoringKey');
    if (args.subscriptionKey && !utils_1.uuidValidate(args.subscriptionKey))
        throw new Error('bad --subscriptionKey');
    if (!args.id)
        args.id = args.appId;
    const newService = new models_1.DispatchService(args);
    const dispatchServices = args.services;
    if (dispatchServices) {
        for (let service of dispatchServices) {
            newService.serviceIds.push(service.id || '');
            if (!linq_collections_1.Enumerable.fromSource(config.services).any(s => s.id == service.id)) {
                switch (service.type) {
                    case schema_1.ServiceType.File:
                    case schema_1.ServiceType.Luis:
                    case schema_1.ServiceType.QnA:
                        config.connectService(service);
                        break;
                }
            }
        }
    }
    // add the service
    config.connectService(newService);
    await config.save();
    process.stdout.write(JSON.stringify(newService, null, 2));
    return config;
}
function showErrorHelp() {
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}
//# sourceMappingURL=msbot-connect-dispatch.js.map