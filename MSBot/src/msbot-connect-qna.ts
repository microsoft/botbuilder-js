/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as chalk from 'chalk';
import * as program from 'commander';
import * as fs from 'fs-extra';
import * as getStdin from 'get-stdin';
import * as txtfile from 'read-text-file';
import { BotConfig } from './BotConfig';
import { QnaMakerService } from './models';
import { IQnAService, ServiceType } from './schema';
import { uuidValidate } from './utils';
import * as validurl from 'valid-url';

program.Command.prototype.unknownOption = function (flag: any) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};

interface ConnectQnaArgs extends IQnAService {
    bot: string;
    secret: string;
    stdin: boolean;
    input?: string;
}

program
    .name('msbot connect qna')
    .description('Connect the bot to a QnA knowledgebase')
    .option('-n, --name <name>', 'name for the QNA knowledgebase')
    .option('-k, --kbId <kbId>', 'QnA Knowledgebase Id ')
    .option('--subscriptionKey <subscriptionKey>', 'Azure Cognitive Service subscriptionKey/accessKey for calling the QnA management API (from azure portal)')
    .option('--endpointKey <endpointKey>', 'endpointKey for calling the QnA service (from https://qnamaker.ai portal or qnamaker list endpointkeys command)')
    .option('--hostname <url>', 'url for private QnA service (example: https://myqna.azurewebsites.net)')

    .option('-b, --bot <path>', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .option('--input <jsonfile>', 'path to arguments in JSON format { id:\'\',name:\'\', ... }')
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('--stdin', 'arguments are passed in as JSON object via stdin')
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
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    } else {
        BotConfig.Load(args.bot, args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
                console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
                showErrorHelp();
            });
    }
}

async function processConnectQnaArgs(config: BotConfig): Promise<BotConfig> {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;

    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(await txtfile.read(<string>args.input)));
    }

    if (!args.kbId || !uuidValidate(args.kbId))
        throw new Error('bad or missing --kbId');

    if (!args.hasOwnProperty('name'))
        throw new Error('missing --name');

    if (!args.subscriptionKey || !uuidValidate(args.subscriptionKey))
        throw new Error('bad or missing --subscriptionKey');

    if (!args.endpointKey || !uuidValidate(args.endpointKey))
        throw new Error('bad or missing --endpointKey');

    if (!args.hostname || !validurl.isWebUri(args.hostname))
        throw new Error('bad or missing --hostname');

    // add the service
    let newService = new QnaMakerService(args);
    config.connectService(newService);

    await config.save();
    process.stdout.write(JSON.stringify(newService, null, 2));
    return config;
}

function showErrorHelp()
{
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}