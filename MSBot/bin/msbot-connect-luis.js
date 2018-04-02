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
const linq_collections_1 = require("linq-collections");
program
    .description('Connect the bot to a LUIS application')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appid <appid>', 'AppId for the LUIS App')
    .option('-r, --regions <regions>', 'comma delimited list of regions for the LUIS app [westus,eastus,...]')
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (!args.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
        .then(processConnectLuisArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
else {
    BotConfig_1.BotConfig.Load(args.bot)
        .then(processConnectLuisArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
function processConnectLuisArgs(config) {
    return __awaiter(this, void 0, void 0, function* () {
        args.name = args.hasOwnProperty('name') ? args.name : config.name;
        let regions = linq_collections_1.Enumerable.fromSource(args.regions.split(',')).select(r => r.trim()).toArray();
        // add the service
        config.addService({
            type: BotConfig_1.ServiceType.Luis,
            name: args.name,
            id: args.appid,
            regions: regions
        });
        yield config.Save();
        return config;
    });
}
//# sourceMappingURL=msbot-connect-luis.js.map