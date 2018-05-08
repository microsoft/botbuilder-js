"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require("chalk");
const program = require("commander");
const getStdin = require("get-stdin");
const txtfile = require("read-text-file");
const BotConfig_1 = require("./BotConfig");
const models_1 = require("./models");
const utils_1 = require("./utils");
const validurl = require("valid-url");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    showErrorHelp();
};
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
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split('\n')[0]));
            showErrorHelp();
        });
    }
}
async function processConnectQnaArgs(config) {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(await txtfile.read(args.input)));
    }
    if (!args.kbId || !utils_1.uuidValidate(args.kbId))
        throw new Error('bad or missing --kbId');
    if (!args.hasOwnProperty('name'))
        throw new Error('missing --name');
    if (!args.subscriptionKey || !utils_1.uuidValidate(args.subscriptionKey))
        throw new Error('bad or missing --subscriptionKey');
    if (!args.endpointKey || !utils_1.uuidValidate(args.endpointKey))
        throw new Error('bad or missing --endpointKey');
    if (!args.hostname || !validurl.isWebUri(args.hostname))
        throw new Error('bad or missing --hostname');
    // add the service
    let newService = new models_1.QnaMakerService(args);
    config.connectService(newService);
    await config.save();
    process.stdout.write(JSON.stringify(newService, null, 2));
    return config;
}
function showErrorHelp() {
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}
//# sourceMappingURL=msbot-connect-qna.js.map