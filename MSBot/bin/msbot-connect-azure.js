"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require("chalk");
const program = require("commander");
const getStdin = require("get-stdin");
const validurl = require("valid-url");
const txtfile = require("read-text-file");
const BotConfig_1 = require("./BotConfig");
const models_1 = require("./models");
const schema_1 = require("./schema");
const utils_1 = require("./utils");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};
program
    .name('msbot connect azure')
    .description('Connect the bot to Azure Bot Service')
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-n, --name <name>', 'Name of the azure bot service')
    .option('-t, --tenantId <tenantId>', 'id of the tenant for the Azure Bot Service Registrartion (either GUID or xxx.onmicrosoft.com)')
    .option('-s, --subscriptionId <subscriptionId>', 'GUID of the subscription for the Azure Bot Service')
    .option('-r, --resourceGroup <resourceGroup>', 'name of the resourceGroup for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', '(OPTIONAL) Registered endpoint url for the Azure Bot Service')
    .option('-a, --appId  <appid>', '(OPTIONAL) Microsoft AppId for the Azure Bot Service\n')
    .option('-p, --appPassword  <appPassword>', '(OPTIONAL) Microsoft AppPassword for the Azure Bot Service\n')
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
            showErrorHelp();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
}
async function processConnectAzureArgs(config) {
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(await txtfile.read(args.input)));
    }
    if (!args.id || args.id.length == 0)
        throw new Error('Bad or missing --id for registered bot');
    if (!args.tenantId || args.tenantId.length == 0)
        throw new Error('Bad or missing --tenantId');
    if (!args.subscriptionId || !utils_1.uuidValidate(args.subscriptionId))
        throw new Error('Bad or missing --subscriptionId');
    if (!args.resourceGroup || args.resourceGroup.length == 0)
        throw new Error('Bad or missing --resourceGroup for registered bot');
    let services = [];
    let service = new models_1.AzureBotService({
        type: schema_1.ServiceType.AzureBotService,
        id: args.id,
        name: args.hasOwnProperty('name') ? args.name : args.id,
        tenantId: args.tenantId,
        subscriptionId: args.subscriptionId,
        resourceGroup: args.resourceGroup
    });
    config.connectService(service);
    services.push(service);
    if (args.endpoint) {
        if (!args.endpoint || !validurl.isHttpsUri(args.endpoint))
            throw new Error('Bad or missing --endpoint');
        if (!args.appId || !utils_1.uuidValidate(args.appId))
            throw new Error('Bad or missing --appId');
        if (!args.appPassword || args.appPassword.length == 0)
            throw new Error('Bad or missing --appPassword');
        let endpointService = new models_1.EndpointService({
            type: schema_1.ServiceType.Endpoint,
            id: args.endpoint,
            name: args.name || args.endpoint,
            appId: args.appId,
            appPassword: args.appPassword,
            endpoint: args.endpoint
        });
        config.connectService(endpointService);
        services.push(endpointService);
    }
    await config.save();
    process.stdout.write(JSON.stringify(services, null, 2));
    return config;
}
function showErrorHelp() {
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}
//# sourceMappingURL=msbot-connect-azure.js.map