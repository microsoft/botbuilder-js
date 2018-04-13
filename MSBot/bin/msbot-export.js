"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .name("msbot export")
    .description("export all of the connected services to local files")
    .option('-bot, -b', "path to bot file.  If omitted, local folder will look for a .bot file")
    .action((cmd, actions) => {
});
program.parse(process.argv);
console.error("not implemented yet");
//# sourceMappingURL=msbot-export.js.map