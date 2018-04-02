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
const BotConfig_1 = require("./BotConfig");
program
    .description('Connect the bot to a QnA knowledgebase')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-n, --name <name>', 'name for the QNA database')
    .option('-k, --kbid <kbid>', 'QnA Knowledgebase Id ')
    .action((cmd, actions) => {
});
program.parse(process.argv);
let args = program.parse(process.argv);
if (!args.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectQnaArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
else {
    BotConfig_1.BotConfig.Load(args.bot)
        .then(processConnectQnaArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
function processConnectQnaArgs(config) {
    return __awaiter(this, void 0, void 0, function* () {
        args.name = args.hasOwnProperty('name') ? args.name : config.name;
        // add the service
        config.addService({
            type: BotConfig_1.ServiceType.QnA,
            name: args.name,
            id: args.kbid
        });
        yield config.Save();
        return config;
    });
}
//# sourceMappingURL=msbot-connect-qna.js.map