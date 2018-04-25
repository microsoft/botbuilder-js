import * as program from 'commander';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import * as path from 'path';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { uuidValidate } from './utils';
import { IConnectedService, ILuisService, IDispatchService, IAzureBotService, IBotConfig, IEndpointService, IQnAService, IFileService } from './schema';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};

interface ConnectFileArgs extends IFileService {
    bot: string;
    secret: string;
}

program
    .name("msbot connect file <path>")
    .description('Connect a file to the bot')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((filePath, actions) => {
        if (filePath)
            actions.filePath = filePath;
    });

let args = <ConnectFileArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectFile)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectFile)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectFile(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (!args.hasOwnProperty('filePath'))
        throw new Error("Bad or missing file");

    // add the service
    let newService = <IFileService>{
        type: ServiceType.File,
        id: args.filePath,
        name: path.basename(args.filePath),
        filePath: args.filePath
    };
    config.connectService(newService);
    await config.Save();
    process.stdout.write(`Connected ${newService.type}:${newService.name} ${newService.filePath}`);
    return config;
}
