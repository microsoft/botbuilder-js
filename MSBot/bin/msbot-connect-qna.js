"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
const fs = require("fs-extra");
const getStdin = require("get-stdin");
const BotConfig_1 = require("./BotConfig");
const utils_1 = require("./utils");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${flag}`));
    program.help();
};
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
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectQnaArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectQnaArgs(config) {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(args.input, 'utf8')));
    }
    if (!args.kbid || !utils_1.uuidValidate(args.kbid))
        throw new Error("bad or missing --kbid");
    if (!args.hasOwnProperty('name'))
        throw new Error("missing --name");
    if (!args.subscriptionKey || !utils_1.uuidValidate(args.subscriptionKey))
        throw new Error("bad or missing --subscriptionKey");
    // add the service
    config.connectService({
        type: BotConfig_1.ServiceType.QnA,
        name: args.name,
        id: args.kbid,
        kbid: args.kbid,
        subscriptionKey: args.subscriptionKey
    });
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-connect-qna.js.map