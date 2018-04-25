import * as program from 'commander';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { uuidValidate } from './utils';
import { IConnectedService, ILuisService, IDispatchService, IAzureBotService, IBotConfig, IEndpointService, IQnAService } from './schema';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};

interface ConnectQnaArgs extends IQnAService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
}

program
    .name("msbot connect qna")
    .description('Connect the bot to a QnA knowledgebase')
    .option('-n, --name <name>', 'name for the QNA database')
    .option('-k, --kbid <kbid>', 'QnA Knowledgebase Id ')
    .option('--subscriptionKey <subscriptionKey>', 'subscriptionKey for calling the QnA service\n')

    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--input <jsonfile>', "path to arguments in JSON format { id:'',name:'', ... }")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('--stdin', "arguments are passed in as JSON object via stdin")
    .action((cmd, actions) => {

    });

program.parse(process.argv);

let args = <ConnectQnaArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectQnaArgs(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(<string>args.input, 'utf8')));
    }

    if (!args.kbid || !uuidValidate(args.kbid))
        throw new Error("bad or missing --kbid");

    if (!args.hasOwnProperty('name'))
        throw new Error("missing --name");

    if (!args.subscriptionKey || !uuidValidate(args.subscriptionKey))
        throw new Error("bad or missing --subscriptionKey");

    // add the service
    let newService = <IQnAService>{
        type: ServiceType.QnA,
        name: args.name,
        id: args.kbid,
        kbid: args.kbid,
        subscriptionKey: args.subscriptionKey
    };
    config.connectService(newService);

    await config.Save();
    process.stdout.write(`Connected ${newService.type}:${newService.name} ${newService.kbid}`);
    return config;
}
