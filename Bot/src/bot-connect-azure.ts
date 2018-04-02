import * as program from 'commander';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectAzureArgs {
    bot: string;
    id: string;
    appid: string;
    endpoint: string;
}

program
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-a, --appid <appid>', 'Microsoft AppId for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', "endpoint for the bot using the MSA AppId")
    .action((cmd, actions) => {

    });

let args = <ConnectAzureArgs><any>program.parse(process.argv);

if (!args.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectAzureArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(args.bot)
        .then(processConnectAzureArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {

    if (args.id && args.id.length > 0)
        config.id = args.id;

    if (args.appid && args.appid.length > 0)
        config.appid = args.appid;

    if (args.endpoint) {
        config.addEndpoint(args.endpoint);
    }

    await config.Save();
    return config;
}
