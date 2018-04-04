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
const chalk = require("chalk");
const BotConfig_1 = require("./BotConfig");
program
    .name("msbot list")
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .action((cmd, actions) => {
});
let parsed = program.parse(process.argv);
if (!parsed.bot) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd())
        .then(processListArgs)
        .catch((reason) => {
        console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
        program.help();
    });
}
else {
    BotConfig_1.BotConfig.Load(parsed.bot)
        .then(processListArgs)
        .catch((reason) => {
        console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
        program.help();
    });
}
function processListArgs(config) {
    return __awaiter(this, void 0, void 0, function* () {
        if (parsed.secret) {
            config.cryptoPassword = parsed.secret;
            for (let service of config.services) {
                for (var prop in service) {
                    let val = service[prop];
                    if (typeof val === "string") {
                        service[prop] = config.decryptValue(val);
                    }
                }
            }
        }
        console.log(JSON.stringify(config.services, null, 4));
        return config;
    });
}
//# sourceMappingURL=msbot-list.js.map