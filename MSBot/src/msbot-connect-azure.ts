import * as program from 'commander';
import * as validurl from 'valid-url';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { uuidValidate } from './utils';
import { IConnectedService, ILuisService, IDispatchService, IAzureBotService, IBotConfig, IEndpointService, IQnAService } from './schema';

interface ConnectAzureArgs extends IAzureBotService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
}

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
    .option('--stdin', "arguments are passed in as JSON object via stdin")
    .option('--input <jsonfile>', "arguments passed in as path to arguments in JSON format")
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
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
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

    if (!args.id)
        throw new Error("Bad or missing --id for registered bot");

    if (!args.appId || !uuidValidate(args.appId))
        throw new Error("Bad or missing --appId");

    if (!args.appPassword)
        throw new Error("Bad or missing --appPassword");

    if (!args.endpoint)
        throw new Error("missing --endpoint");

    if (!validurl.isWebUri(args.endpoint))
        throw new Error(`--endpoint ${args.endpoint} is not a valid url`);

    config.connectService(<IAzureBotService>{
        type: ServiceType.AzureBotService,
        id: args.id, // bot id
        name: args.hasOwnProperty('name') ? args.name : args.id,
        appId: args.appId,
        appPassword: args.appPassword,
        endpoint: args.endpoint
    });

    await config.Save();
    return config;
}
