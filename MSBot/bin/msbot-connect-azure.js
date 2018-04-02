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
    .description('Connect the bot to Azure Bot Service')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-i, --id <id>', 'Azure Bot Service bot id')
    .option('-a, --appid <appid>', 'Microsoft AppId for the Azure Bot Service')
    .option('-e, --endpoint <endpoint>', "endpoint for the bot using the MSA AppId")
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (!args.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectAzureArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
else {
    BotConfig_1.BotConfig.Load(args.bot)
        .then(processConnectAzureArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
function processConnectAzureArgs(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (args.id && args.id.length > 0)
            config.id = args.id;
        if (args.appid && args.appid.length > 0)
            config.appid = args.appid;
        if (args.endpoint) {
            config.addEndpoint(args.endpoint);
        }
        yield config.Save();
        return config;
    });
}
//# sourceMappingURL=msbot-connect-azure.js.map