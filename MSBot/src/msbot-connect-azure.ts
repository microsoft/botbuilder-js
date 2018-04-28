import * as chalk from 'chalk';
import * as program from 'commander';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import * as validurl from 'valid-url';
import { BotConfig } from './BotConfig';
import { AzureBotService, EndpointService } from './models';
import { IAzureBotService, ServiceType } from './schema';
import { uuidValidate } from './utils';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};

interface ConnectAzureArgs extends IAzureBotService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
    endpoint: string;
    appPassword: string;
}

program
    .name('msbot connect azure')
    .description('Connect the bot to Azure Bot Service')
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-a, --appId  <appid>', 'Microsoft AppId for the Azure Bot Service\n')
    .option('-p, --appPassword  <appPassword>', 'Microsoft AppPassword for the Azure Bot Service\n')
    .option('-e, --endpoint <endpoint>', 'Registered endpoint url for the Azure Bot Service')
    .option('-n, --name <name>', '(OPTIONAL) name of the azure bot service')
    .option('-t, --tenantId <tenantId>', 'id of the tenant for the Azure Bot Service Registrartion')
    .option('-s, --subscriptionId <subscriptionId>', 'id of the subscription for the Azure Bot Service Registrartion')
    .option('-r, --resourceGroup <resourceGroup>', 'name of the resourceGroup for the Azure Bot Service Registrartion')

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
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                program.help();
            });
    }
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(<string>args.input, 'utf8')));
    }

    if (!args.id || args.id.length == 0)
        throw new Error('Bad or missing --id for registered bot');

    if (!args.appId || !uuidValidate(args.appId))
        throw new Error('Bad or missing --appId');

    if (!args.appPassword || args.appPassword.length == 0)
        throw new Error('Bad or missing --appPassword');

    if (!args.endpoint || !validurl.isHttpsUri(args.endpoint))
        throw new Error('Bad or missing --endpoint');

    if (!args.tenantId || args.tenantId.length == 0)
        throw new Error('Bad or missing --tenantId');

    if (!args.subscriptionId || !uuidValidate(args.subscriptionId))
        throw new Error('Bad or missing --subscriptionId');

    if (!args.resourceGroup || args.resourceGroup.length == 0)
        throw new Error('Bad or missing --resourceGroup for registered bot');

    let service = new AzureBotService({
        type: ServiceType.AzureBotService,
        id: args.id, // bot id
        name: args.hasOwnProperty('name') ? args.name : args.id,
        appId: args.appId,
        tenantId: args.tenantId,
        subscriptionId: args.subscriptionId,
        resourceGroup: args.resourceGroup
    });
    config.connectService(service);

    let endpointService = new EndpointService({
        type: ServiceType.Endpoint,
        id: args.endpoint,
        name: args.endpoint,
        appId: args.appId,
        appPassword: args.appPassword,
        endpoint: args.endpoint
    })
    config.connectService(endpointService);

    await config.save();

    process.stdout.write(`Connected ${service.type}:${service.name} ${service.id}\n`);
    process.stdout.write(`Connected ${endpointService.type}:${endpointService.endpoint}\n`);
    return config;
}
