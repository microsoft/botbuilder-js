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
const validurl = require("valid-url");
const BotConfig_1 = require("./BotConfig");
const models_1 = require("./models");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};
program
    .name('msbot connect endpoint')
    .description('Connect the bot to an endpoint')
    .option('-e, --endpoint <endpoint>', 'url for the endpoint\n')
    .option('-n, --name <name>', '(OPTIONAL) name of the endpoint')
    .option('-a, --appId  <appid>', '(OPTIONAL) Microsoft AppId used for auth with the endpoint')
    .option('-p, --appPassword <password>', '(OPTIONAL) Microsoft app password used for auth with the endpoint')
    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--input <jsonfile>', 'path to arguments in JSON format { id:\'\',name:\'\', ... }')
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('--stdin', 'arguments are passed in as JSON object via stdin')
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    showErrorHelp();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectEndpointArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectEndpointArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
}
async function processConnectEndpointArgs(config) {
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(await txtfile.read(args.input)));
    }
    if (!args.endpoint)
        throw new Error('missing --endpoint');
    if (!validurl.isHttpUri(args.endpoint) && !validurl.isHttpsUri(args.endpoint)) {
        throw new Error(`--endpoint ${args.endpoint} is not a valid url`);
    }
    if (args.appId && !utils_1.uuidValidate(args.appId))
        throw new Error('--appId is not valid');
    if (args.appPassword && args.appPassword.length == 0)
        throw new Error('zero length --appPassword');
    if (!args.hasOwnProperty('name')) {
        if (args.appId)
            args.name = `${args.endpoint} - ${args.appId}`;
        else
            args.name = args.endpoint;
    }
    let idCount = 1;
    let id;
    while (true) {
        id = `${idCount}`;
        if (linq_collections_1.Enumerable.fromSource(config.services)
            .where(s => s.type == schema_1.ServiceType.Endpoint && s.id == id)
            .any() == false)
            break;
        idCount++;
    }
    let newService = new models_1.EndpointService({
        id,
        name: args.name,
        appId: (args.appId && args.appId.length > 0) ? args.appId : '',
        appPassword: (args.appPassword && args.appPassword.length > 0) ? args.appPassword : '',
        endpoint: args.endpoint
    });
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
//# sourceMappingURL=msbot-connect-endpoint.js.map