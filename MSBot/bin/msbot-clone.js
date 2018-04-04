"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
program
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .description('allows you to clone a bot with a new configuration')
    .action((cmd, actions) => {
});
program.parse(process.argv);
console.error("not implemented yet");
//# sourceMappingURL=msbot-clone.js.map