const Table = require('cli-table2');
const chalk = require('chalk');

module.exports = function () {
    process.stdout.write('\nChatdown cli tool used to parse chat dialogs into transcripts\n\n© 2018 Microsoft Corporation\n\n');
    process.stdout.write(chalk.cyan.bold(`chatdown [chat] [--help]\n\n`));
    let x = 'getWindowSize' in process.stdout ? process.stdout.getWindowSize()[0] : 50;
    let left = 20;
    let right = x - left - 3; // 3 is for 3 vertical bar characters
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
    table.push([chalk.cyan.bold('--help'), 'Prints this help info to the console.']);
    process.stdout.write(table.toString()+'\n');
};
