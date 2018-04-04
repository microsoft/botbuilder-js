"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
program
    .description('Connect the bot to a QnA knowledgebase')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the QNA database')
    .option('-k, --kbid <kbid>', 'QnA Knowledgebase Id ')
    .option('--subscriptionKey <subscriptionKey>', 'subscriptionKey for calling the QnA service')
    .action((cmd, actions) => {
});
program.parse(process.argv);
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectQnaArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot)
            .then(processConnectQnaArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
function processConnectQnaArgs(config) {
    return __awaiter(this, void 0, void 0, function* () {
        args.name = args.hasOwnProperty('name') ? args.name : config.name;
        if (args.secret) {
            config.cryptoPassword = args.secret;
        }
        if (!args.kbid)
            throw new Error("missing kbid");
        if (!args.hasOwnProperty('name'))
            throw new Error("missing name");
        if (!args.subscriptionKey)
            throw new Error('missing subscriptionKey');
        // add the service
        config.connectService({
            type: BotConfig_1.ServiceType.QnA,
            name: args.name,
            id: args.kbid,
            kbid: args.kbid,
            subscriptionKey: args.subscriptionKey
        });
        yield config.Save();
        return config;
    });
}
//# sourceMappingURL=msbot-connect-qna.js.map