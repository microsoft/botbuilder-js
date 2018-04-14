import * as program from 'commander';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { uuidValidate } from './utils';
import { IConnectedService, ILuisService, IDispatchService, IAzureBotService, IBotConfig, IEndpointService, IQnAService } from './schema';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};

interface ConnectLuisArgs extends ILuisService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
}

program
    .name("msbot connect dispatch")
    .description('Connect the bot to a dispatch model')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the dispatch')
    .option('-a, --appId <appid>', 'LUID AppId for the dispatch app')
    .option('-v, --version <version>', 'version for the dispatch app, (example: 0.1)')
    .option('--subscriptionKey <subscriptionKey>', 'subscription key used for querying the dispatch model')
    .option('--authoringKey <authoringkey>', 'authoring key for using manipulating the dispatch model via the LUIS authoring API')
    .option('--stdin', "arguments are passed in as JSON object via stdin")
    .option('--input <jsonfile>', "arguments passed in as path to arguments in JSON format")
    .action((cmd, actions) => {

    });

let args = <ConnectLuisArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectDispatch)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectDispatch)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectDispatch(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(<string>args.input, 'utf8')));
    }

    if (!args.hasOwnProperty('name'))
        throw new Error("Bad or missing --name");

    if (!args.appId || !uuidValidate(args.appId))
        throw new Error("bad or missing --appId");

    if (!args.version || parseInt(args.version))
        throw new Error("bad or missing --version");

    if (!args.authoringKey || !uuidValidate(args.authoringKey))
        throw new Error("bad or missing --authoringKey");

    if (!args.subscriptionKey || !uuidValidate(args.subscriptionKey))
        throw new Error("bad or missing --subscriptionKey");

    // add the service
    config.connectService(
        config.encryptService(<IDispatchService>{
            type: ServiceType.Dispatch,
            name: args.name,
            id: args.appId,
            appId: args.appId,
            version: args.version,
            subscriptionKey: args.subscriptionKey,
            authoringKey: args.authoringKey
        }));
    await config.Save();
    return config;
}
