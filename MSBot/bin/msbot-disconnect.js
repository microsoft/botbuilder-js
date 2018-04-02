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
    .arguments("<service_id_or_Name>")
    .description("disconnect a connected service by id or name")
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .action((idOrName, actions) => {
    actions.idOrName = idOrName;
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
        config.removeServiceByNameOrId(args.idOrName);
        yield config.Save();
        return config;
    });
}
//# sourceMappingURL=msbot-disconnect.js.map