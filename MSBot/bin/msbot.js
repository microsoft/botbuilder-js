#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const process = require("process");
const program = require("commander");
const pkg = require('../package.json');
const semver = require('semver');
let requiredVersion = pkg.engines.node;
if (!semver.satisfies(process.version, requiredVersion)) {
    console.error(`Required node version ${requiredVersion} not satisfied with current version ${process.version}.`);
    process.exit(1);
}
program.Command.prototype.unknownOption = function (flag) {
    console.error(chalk.default.redBright(`Unknown arguments: ${process.argv.slice(2).join(' ')}`));
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
};
program
    .version(pkg.version, '-V, --Version')
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
const args = program.parse(process.argv);
// args should be undefined is subcommand is executed
if (args) {
    const a = process.argv.slice(2);
    console.error(chalk.default.redBright(`Unknown arguments: ${a.join(' ')}`));
    program.outputHelp((str) => {
        console.error(str);
        return '';
    });
    process.exit(1);
}
//# sourceMappingURL=msbot.js.map