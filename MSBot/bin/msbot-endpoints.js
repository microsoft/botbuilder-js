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
const process = require("process");
const program = require("commander");
const BotConfig_1 = require("./BotConfig");
const linq_collections_1 = require("linq-collections");
program
    .arguments('[url]')
    .description('add or remove an endpoint url for the bot')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('-r, --remove', "remove endpoint url")
    .option('-l, --list', "list endpoints")
    .option('-n, --name <name>', "name of endpoint")
    .action((cmd, actions) => {
    actions.url = cmd;
});
let endpointArgs = program.parse(process.argv);
if (!endpointArgs || !endpointArgs.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
        .then(processEndpointArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
else {
    BotConfig_1.BotConfig.Load(endpointArgs.bot)
        .then(processEndpointArgs)
        .catch((reason) => console.error(reason.toString().split("\n")[0]));
}
function processEndpointArgs(botConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        let endpoints = new linq_collections_1.List(botConfig.endpoints);
        if (endpointArgs.list) {
            console.log(JSON.stringify(botConfig.endpoints, null, 4));
        }
        else if (endpointArgs.remove) {
            botConfig.removeEndpoint(endpointArgs.url || endpointArgs.name);
            botConfig.Save();
        }
        else {
            botConfig.addEndpoint(endpointArgs.url, endpointArgs.name);
            botConfig.Save();
        }
        return botConfig;
    });
}
//# sourceMappingURL=msbot-endpoints.js.map