"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const process = require("process");
const path = require("path");
const program = require("commander");
const BotConfig_1 = require("./BotConfig");
program
    .action((cmd, actions) => { });
let parsed = program.parse(process.argv);
if (parsed.args.length == 0) {
    BotConfig_1.BotConfig.LoadBotFromFolder(process.env.__dirname)
        .then((bot) => {
        console.log(JSON.stringify(bot.services, null, 4));
    });
}
else {
    let file = parsed.args[0];
    if (path.extname(file) != '.bot')
        file = file + '.bot';
    BotConfig_1.BotConfig.Load(file)
        .then((bot) => {
        console.log(JSON.stringify(bot.services, null, 4));
    });
}
//# sourceMappingURL=msbot-list.js.map