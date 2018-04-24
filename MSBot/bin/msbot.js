#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const chalk = require("chalk");
var pjson = require('../package.json');
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.help();
};
program
    .version(pjson.version, '-V, --Version')
    .description(`The msbot program makes it easy to manipulate .bot files for Microsoft Bot Framework tools.`);
program
    .command('init', 'create a new .bot file');
program
    .command('secret', 'set or clear the secret for a .bot file');
// program
//     .command('export', 'export all connected services');
// program
//     .command('clone', 'create a new .bot file based on another .bot file');
program
    .command('connect <service>', 'connect to a resource (Luis/Qna/Azure/...) used by the bot');
program
    .command('disconnect <service>', 'disconnect from a resource used by the bot');
program
    .command('list', 'list all connected services');
var args = program.parse(process.argv);
// args should be undefined is subcommand is executed
if (args) {
    var a = process.argv.slice(2);
    console.error(chalk.default.redBright(`Unknown arguments: ${a.join(' ')}`));
    program.help();
}
//# sourceMappingURL=msbot.js.map