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
    .name("msbot connect luis")
    .description('Connect the bot to a LUIS application')
    .option('-n, --name <name>', 'name for the LUIS app')
    .option('-a, --appId <appid>', 'AppId for the LUIS App')
    .option('-v, --version <version>', 'version for the LUIS App, (example: v0.1)')
    .option('--authoringKey <authoringkey>', 'authoring key for using manipulating LUIS apps via the authoring API (See http://aka.ms/luiskeys for help)')
    .option('--subscriptionKey <subscriptionKey>', '(OPTIONAL) subscription key used for querying a LUIS model\n')
    .option('-b, --bot <path>', "path to bot file.  If omitted, local folder will look for a .bot file")
    .option('--input <jsonfile>', "path to arguments in JSON format { id:'',name:'', ... }")
    .option('--secret <secret>', 'bot file secret password for encrypting service secrets')
    .option('--stdin', "arguments are passed in as JSON object via stdin")
    .action((cmd, actions) => {
});
let args = program.parse(process.argv);
if (process.argv.length < 3) {
    program.help();
}
else {
    if (!args.bot) {
        BotConfig_1.BotConfig.LoadBotFromFolder(process.cwd(), args.secret)
            .then(processConnectLuisArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
    else {
        BotConfig_1.BotConfig.Load(args.bot, args.secret)
            .then(processConnectLuisArgs)
            .catch((reason) => {
            console.error(chalk.default.redBright(reason.toString().split("\n")[0]));
            program.help();
        });
    }
}
async function processConnectLuisArgs(config) {
    args.name = args.hasOwnProperty('name') ? args.name : config.name;
    if (args.stdin) {
        Object.assign(args, JSON.parse(await getStdin()));
    }
    else if (args.input != null) {
        Object.assign(args, JSON.parse(fs.readFileSync(args.input, 'utf8')));
    }
    if (!args.hasOwnProperty('name'))
        throw new Error("Bad or missing --name");
    if (!args.appId || !utils_1.uuidValidate(args.appId))
        throw new Error("bad or missing --appId");
    if (!args.version || parseFloat(args.version) == 0)
        throw new Error("bad or missing --version");
    if (!args.authoringKey || !utils_1.uuidValidate(args.authoringKey))
        throw new Error("bad or missing --authoringKey");
    //if (!args.subscriptionKey || !uuidValidate(args.subscriptionKey))
    //    throw new Error("bad or missing --subscriptionKey");
    // add the service
    config.connectService({
        type: BotConfig_1.ServiceType.Luis,
        name: args.name,
        id: args.appId,
        appId: args.appId,
        version: args.version,
        subscriptionKey: args.subscriptionKey,
        authoringKey: args.authoringKey
    });
    await config.Save();
    return config;
}
//# sourceMappingURL=msbot-connect-luis.js.map