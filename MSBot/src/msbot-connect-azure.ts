import * as program from 'commander';
import * as validurl from 'valid-url';
import * as chalk from 'chalk';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectAzureArgs extends IAzureBotService {
    bot: string;
    secret: string;
}

program
    .description('Connect the bot to Azure Bot Service')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-n, --name <name>', 'name of the azure bot service')
    .option('-a, --appId  <appid>', 'Microsoft AppId for the Azure Bot Service')
    .option('-p, --appPassword <password>', 'Microsoft app password for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', "endpoint for the bot using the MSA AppId")
    .action((cmd, actions) => {

    });

let args = <ConnectAzureArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {

    if (args.secret) {
        config.cryptoPassword = args.secret;
    }

    if (!args.id)
        throw new Error("Bad or missing id");

    if (!args.appId)
        throw new Error("Bad or missing appId");

    if (!args.appPassword)
        throw new Error("Bad or missing appPassword");

    if (!args.endpoint)
        throw new Error("missing endpoint");

    if (!validurl.isWebUri(args.endpoint)) 
        throw new Error(`${args.endpoint} is not a valid url`);

    config.connectService(<IAzureBotService>{
        type: ServiceType.AzureBotService,
        id: args.id,
        name: args.hasOwnProperty('name') ? args.name : args.id,
        appId: args.appId,
        appPassword: config.encryptValue(args.appPassword),
        endpoint: args.endpoint
    });

    await config.Save();
    return config;
}
