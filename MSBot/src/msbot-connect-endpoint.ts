import * as program from 'commander';
import * as validurl from 'valid-url';
import * as chalk from 'chalk';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { uuidValidate } from './utils';

interface ConnectEndpointArgs extends ILocalhostService {
    bot: string;
    secret: string;
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

    if (!args.endpoint)
        throw new Error("missing --endpoint");

    if (!validurl.isWebUri(args.endpoint)) {
        throw new Error(`--endpoint ${args.endpoint} is not a valid url`);
    }

    if (args.appId && !uuidValidate(args.appId))
        throw new Error("--appId is not valid");

    if (args.appId && !args.appPassword)
        throw new Error("Bad or missing --appPassword");

    let id = `${args.appId}${args.endpoint}`;
    let hasCredentials = (args.appId && args.appPassword && args.appId.length > 0 && args.appPassword.length > 0);
    let credentialLabel = (hasCredentials) ? ' with AppID' : '';

    config.connectService(<ILocalhostService>{
        type: ServiceType.Endpoint,
        id: id,
        name: args.hasOwnProperty('name') ? args.name : `${args.endpoint}${credentialLabel}`,
        appId: (args.appId && args.appId.length > 0) ? args.appId : null,
        appPassword: (args.appPassword && args.appPassword.length > 0) ? config.encryptValue(args.appPassword) : null,
        endpoint: args.endpoint
    });

    await config.Save();
    return config;
}
