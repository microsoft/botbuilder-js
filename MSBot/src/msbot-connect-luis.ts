import * as program from 'commander';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectLuisArgs {
    bot: string;
    secret: string;
    name: string;
    appid: string;
    regions: string;
    subscriptionkey: string;
    authoringkey: string;
}

program
    .description('Connect the bot to a LUIS application')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appid <appid>', 'AppId for the LUIS App')
    .option('--subscriptionkey <subscriptionkey>', 'subscriptionKey for calling the LUIS service')
    .option('--authoringkey <authoringkey>', 'authoering key for authoring LUIS models via the authoring API')
    .option('-r, --regions <regions>', 'comma delimited list of regions for the LUIS app [westus,eastus,...]')
    .action((cmd, actions) => {

    });

let args = <ConnectLuisArgs><any>program.parse(process.argv);

if (!args.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectLuisArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(args.bot)
        .then(processConnectLuisArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

async function processConnectLuisArgs(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (args.secret) {
        config.cryptoPassword = args.secret;
    }

    let regions = Enumerable.fromSource((args.regions || '').split(',')).select(r => r.trim()).toArray();

    // add the service
    config.connectService(<ILuisService>{
        type: ServiceType.Luis,
        name: args.name,
        id: args.appid,
        appId: args.appid,
        subscriptionkey: config.encryptValue(args.subscriptionkey),
        authoringkey: config.encryptValue(args.authoringkey),
        regions: regions
    });
    await config.Save();
    return config;
}
