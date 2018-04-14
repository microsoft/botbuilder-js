import * as program from 'commander';
import * as validurl from 'valid-url';
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

interface ConnectEndpointArgs extends IEndpointService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
}

program
    .name("msbot connect endpoint")
    .description('Connect the bot to an endpoint')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name of the endpoint')
    .option('-a, --appId  <appid>', 'Microsoft AppId used for auth with the endpoint')
    .option('-p, --appPassword <password>', 'Microsoft app password used for auth with the endpoint')
    .option('-e, --endpoint <endpoint>', "url for the endpoint")
    .option('--stdin', "arguments are passed in as JSON object via stdin")
    .option('--input <jsonfile>', "arguments passed in as path to arguments in JSON format")
    .action((cmd, actions) => {

    });

let args = <ConnectEndpointArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {

    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectEndpointArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectEndpointArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectEndpointArgs(config: BotConfig): Promise<BotConfig> {
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(<string>args.input, 'utf8')));
    }

    if (!args.endpoint)
        throw new Error("missing --endpoint");

    if (!validurl.isWebUri(args.endpoint)) {
        throw new Error(`--endpoint ${args.endpoint} is not a valid url`);
    }

    if (!args.hasOwnProperty('name'))
        throw new Error("Bad or missing --name");

    if (args.appId && !uuidValidate(args.appId))
        throw new Error("--appId is not valid");

    if (args.appId && !args.appPassword)
        throw new Error("Bad or missing --appPassword");

    let idCount = 1;
    let id: string;
    while (true) {
        id = `${idCount}`;

        if (Enumerable.fromSource(config.services)
            .where(s => s.type == ServiceType.Endpoint && s.id == id)
            .any() == false)
            break;

        idCount++;
    }

    config.connectService(
        config.encryptService(<IEndpointService>{
            type: ServiceType.Endpoint,
            id: id,
            name: args.name,
            appId: (args.appId && args.appId.length > 0) ? args.appId : null,
            appPassword: (args.appPassword && args.appPassword.length > 0) ? args.appPassword : null,
            endpoint: args.endpoint
        })
    );

    await config.Save();
    return config;
}
