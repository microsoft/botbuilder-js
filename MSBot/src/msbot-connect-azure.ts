/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as chalk from 'chalk';
import * as program from 'commander';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import * as validurl from 'valid-url';
import * as txtfile from 'read-text-file';
import { BotConfig } from './BotConfig';
import { AzureBotService, EndpointService } from './models';
import { IAzureBotService, ServiceType } from './schema';
import { uuidValidate } from './utils';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};

interface ConnectAzureArgs extends IAzureBotService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
    appId?: string;
    endpoint?: string;
    appPassword?: string;
}

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

let args = <ConnectAzureArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    }
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(await txtfile.read(<string>args.input)));
    }

    if (!args.id || args.id.length == 0)
        throw new Error('Bad or missing --id for registered bot');

    if (!args.tenantId || args.tenantId.length == 0)
        throw new Error('Bad or missing --tenantId');

    if (!args.subscriptionId || !uuidValidate(args.subscriptionId))
        throw new Error('Bad or missing --subscriptionId');

    if (!args.resourceGroup || args.resourceGroup.length == 0)
        throw new Error('Bad or missing --resourceGroup for registered bot');
    let services=[];
    let service = new AzureBotService({
        type: ServiceType.AzureBotService,
        id: args.id, // bot id
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

        if (!args.appId || !uuidValidate(args.appId))
            throw new Error('Bad or missing --appId');

        if (!args.appPassword || args.appPassword.length == 0)
            throw new Error('Bad or missing --appPassword');


        let endpointService = new EndpointService({
            type: ServiceType.Endpoint,
            id: args.endpoint,
            name: args.name || args.endpoint,
            appId: args.appId,
            appPassword: args.appPassword,
            endpoint: args.endpoint
        })
        config.connectService(endpointService);
        services.push(endpointService);
    }
    await config.save();
    process.stdout.write(JSON.stringify(services, null, 2));
    return config;
}

function showErrorHelp()
{
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}