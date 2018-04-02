import * as program from 'commander';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectLuisArgs {
    bot: string;
    name: string;
    appid: string;
    regions: string;
}

program
    .command('luis', 'connect to LUIS a service')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appid <appid>', 'AppId for the LUIS App')
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

    let regions = Enumerable.fromSource(args.regions.split(',')).select(r => r.trim()).toArray();

    // add the service
    config.addService(<ILuisService>{
        type: ServiceType.Luis,
        name: args.name,
        id: args.appid,
        regions: regions
    });
    await config.Save();
    return config;
}
