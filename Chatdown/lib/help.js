const Table = require('cli-table');
module.exports = function () {
    process.stdout.write('\nChatdown cli tool used to parse chat dialogs into transcripts\n\n© 2018 Microsoft Corporation\n\nUsage:\n\n');
    const table = new Table({head: ['Argument', 'Description',], style: {head: ['green']}});
    table.push({'--in [file] (optional)': ['[file] is the location of the chat file to parse. If omitted, piping is assumed and stdin will be used.']});
    table.push({'--out [file] )(optional)': ['[file] is the location transcript file to write. If omitted, the transcript will be written to stdout.']});
    table.push({'--help': ['Prints this help info to the console.']});
    process.stdout.write(table.toString());
};
