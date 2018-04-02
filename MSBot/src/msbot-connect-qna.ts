import * as program from 'commander';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';

interface ConnectQnaArgs {
    bot: string;
    name: string;
    kbid: string;
}

program
    .description('Connect the bot to a QnA knowledgebase')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-n, --name <name>', 'name for the QNA database')
    .option('-k, --kbid <kbid>', 'QnA Knowledgebase Id ')
    .action((cmd, actions) => {

    });

program.parse(process.argv);

let args = <ConnectQnaArgs><any>program.parse(process.argv);

if (!args.bot) {
    BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectQnaArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
} else {
    BotConfig.Load(args.bot)
        .then(processConnectQnaArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}

async function processConnectQnaArgs(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    // add the service
    config.addService(<IQnAService>{
        type: ServiceType.QnA,
        name: args.name,
        id: args.kbid
    });

    await config.Save();
    return config;
}
