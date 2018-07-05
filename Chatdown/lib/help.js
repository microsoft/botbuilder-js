/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const Table = require('cli-table3');
const chalk = require('chalk');
const windowSize = require('window-size');

module.exports = function (output) {
    if (!output)
        output = process.stderr;
    output.write('\nChatdown cli tool used to parse chat dialogs (.chat file) into a mock transcript file\n\n© 2018 Microsoft Corporation\n\n');
    output.write(chalk.cyan.bold(`chatdown [chat] [--help] [--version]\n\n`));
    let left = 20;
    let right = windowSize.width - left - 3; // 3 is for 3 vertical bar characters
    const table = new Table({
        head: [chalk.bold('Argument'), chalk.bold('Description')],
        // don't use lines for table
        chars: {
            'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
            'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
            'left': '', 'left-mid': '', 'right': '', 'right-mid': '',
            'mid': '', 'mid-mid': '', 'middle': ''
        },
        colWidths: [left, right],
        style: { head: ['white'], 'padding-left': 1, 'padding-right': 1 },
        wordWrap: true
    });
    table.push([chalk.cyan.bold('[chat]'), '[chat] is the location of the chat file to parse. If omitted, piping is assumed and stdin will be used for input.']);
    table.push([chalk.cyan.bold('-v, --version'), 'show version']);
    table.push([chalk.cyan.bold('--help'), 'Prints this help info to the console.']);
    output.write(table.toString()+'\n');
};
