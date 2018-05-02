"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const chalk = require("chalk");
const program = require("commander");
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .name('msbot clone')
    .option('-bot, -b', 'path to bot file.  If omitted, local folder will look for a .bot file')
    .description('allows you to clone a bot with a new configuration')
    .action((cmd, actions) => {
});
program.parse(process.argv);
console.error('not implemented yet');
//# sourceMappingURL=msbot-clone.js.map