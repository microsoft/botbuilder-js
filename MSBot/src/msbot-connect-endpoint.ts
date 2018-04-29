import * as chalk from 'chalk';
import * as program from 'commander';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import { Enumerable } from 'linq-collections';
import * as validurl from 'valid-url';
import { BotConfig } from './BotConfig';
import { EndpointService } from './models';
import { IEndpointService, ServiceType } from './schema';
import { uuidValidate } from './utils';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};

interface ConnectEndpointArgs extends IEndpointService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
}

program
    .name('msbot connect endpoint')
    .description('Connect the bot to an endpoint')
    .option('-e, --endpoint <endpoint>', 'url for the endpoint\n')
    .option('-n, --name <name>', '(OPTIONAL) name of the endpoint')
    .option('-a, --appId  <appid>', '(OPTIONAL) Microsoft AppId used for auth with the endpoint')
    .option('-p, --appPassword <password>', '(OPTIONAL) Microsoft app password used for auth with the endpoint')

    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--input <jsonfile>', 'path to arguments in JSON format { id:\'\',name:\'\', ... }')
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('--stdin', 'arguments are passed in as JSON object via stdin')
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
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectEndpointArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
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
        throw new Error('missing --endpoint');

    if (!validurl.isHttpUri(args.endpoint) && !validurl.isHttpsUri(args.endpoint)) {
        throw new Error(`--endpoint ${args.endpoint} is not a valid url`);
    }

    if (args.appId && !uuidValidate(args.appId))
        throw new Error('--appId is not valid');

    if (args.appPassword && args.appPassword.length == 0)
        throw new Error('zero length --appPassword');

    if (!args.hasOwnProperty('name')) {
        if (args.appId)
            args.name = `${args.endpoint} - ${args.appId}`;
        else
            args.name = args.endpoint;
    }

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
    let newService = new EndpointService({
        id,
        name: args.name,
        appId: ( args.appId && args.appId.length > 0 ) ? args.appId : '',
        appPassword: ( args.appPassword && args.appPassword.length > 0 ) ? args.appPassword : '',
        endpoint: args.endpoint
    });
    config.connectService(newService);

    await config.save();
    process.stdout.write(`Connected ${newService.type}:${newService.name} ${newService.endpoint}`);
    return config;
}
