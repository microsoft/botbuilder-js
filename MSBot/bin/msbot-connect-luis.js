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
    .name("msbot connect luis")
    .description('Connect the bot to a LUIS application')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appId <appid>', 'AppId for the LUIS App')
    .option('-v, --version <version>', 'version for the LUIS App, (example: v0.1)')
    .option('--authoringKey <authoringkey>', 'authoering key for authoring LUIS models via the authoring API')
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
            .then(processConnectLuisArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot)
            .then(processConnectLuisArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
function processConnectLuisArgs(config) {
    return __awaiter(this, void 0, void 0, function* () {
        args.name = args.hasOwnProperty('name') ? args.name : config.name;
        if (args.secret) {
            config.cryptoPassword = args.secret;
        }
        if (!args.hasOwnProperty('name'))
            throw new Error("Bad or missing name");
        if (!args.appId)
            throw new Error("Bad or missing appId");
        if (!args.version)
            throw new Error("missing version");
        if (!args.authoringKey)
            throw new Error("missing authoringKey");
        // add the service
        config.connectService({
            type: BotConfig_1.ServiceType.Luis,
            name: args.name,
            id: args.appId,
            appId: args.appId,
            version: args.version,
            authoringKey: config.encryptValue(args.authoringKey)
        });
        yield config.Save();
        return config;
    });
}
//# sourceMappingURL=msbot-connect-luis.js.map