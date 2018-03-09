const Table = require('cli-table2');
module.exports = function () {
    process.stdout.write('\nChatdown cli tool used to parse chat dialogs into tran; scripts\n\n© 2018 Microsoft Corporation\n\nUsage:\n\n');
    let x = 'getWindowSize' in process.stdout ? process.stdout.getWindowSize()[0] : 50;
    let left = 16;
    let right = x - left - 3; // 3 is for 3 vertical bar characters
    const table = new Table({
        head: ['Argument', 'Description'],
        colWidths: [left, right],
        style: {head: ['green'], 'padding-left': 1, 'padding-right': 1},
        wordWrap: true
    });
    table.push({'--in [file]': ['[file] is the location of the chat file to parse. If omitted, piping is assumed and stdin will be used.']});
    table.push({'--out [file]': ['[file] is the location transcript file to write. If omitted, the transcript will be written to stdout.']});
    table.push({'--help': ['Prints this help info to the console.']});
    process.stdout.write(table.toString());
};
