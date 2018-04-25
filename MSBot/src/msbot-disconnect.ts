import * as program from 'commander';
import * as chalk from 'chalk';
import { BotConfig, ServiceType } from './BotConfig';
import { Enumerable, List, Dictionary } from 'linq-collections';
import { IConnectedService, ILuisService, IDispatchService, IAzureBotService, IBotConfig, IEndpointService, IQnAService } from './schema';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};

interface DisconnectServiceArgs {
    bot: string;
    idOrName: string;
}

program
    .name("msbot disconnect")
    .arguments("<service_id_or_Name>")
    .description("disconnect a connected service by id or name")
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .action((idOrName, actions) => {
        actions.idOrName = idOrName;
    });

let args = <DisconnectServiceArgs><any>program.parse(process.argv);

if (process.argv.length < 3) {
    program.help();
} else {
    if (!args.bot) {
        BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    } else {
        BotConfig.Load(args.bot)
            .then(processConnectAzureArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
                program.help();
            });
    }
}

async function processConnectAzureArgs(config: BotConfig): Promise<BotConfig> {
    if (!args.idOrName) {
        throw new Error("missing id or name of service to disconnect");
    }

    let removedService = config.disconnectServiceByNameOrId(args.idOrName);
    if (removedService != null) {
        await config.Save();
        process.stdout.write(`Disconnected ${removedService.type}:${removedService.name} ${removedService.id}`);
    }

    return config;
}
