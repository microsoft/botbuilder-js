const Table = require('cli-table2');
const chalk = require('chalk');

const manifest = require('./api/qnamaker');

/**
 * Displays help content from the arguments.
 *
 * @returns {Promise<void>}
 */
module.exports = async function help() {
    const helpContents = await getGeneralHelpContents();
    let x = 'getWindowSize' in process.stdout ? process.stdout.getWindowSize()[0] : 50;
    process.stdout.write('\nQnA Maker cli for interacting with the QnA Maker api - © 2018 Microsoft Corporation\n\n');
    process.stdout.write(chalk.bold(`usage: qnamaker ${chalk.cyan('<operation name> [--<args> --<globalArgs>]')}\n\n`));
    helpContents.forEach(helpContent => {
        const rows = helpContent.table[0].length;
        const colWidths = [25];

        if (rows === 2) {
            colWidths.push(~~((x * .95) - 25));
        }
        if (rows === 3) {
            colWidths.push(~~((x * .30) - 12.5), ~~((x * .65) - 12.5));
        }

        const table = new Table({
            colWidths,
            style: {'padding-left': 1, 'padding-right': 1},
            wordWrap: true
        });
        table.push(...helpContent.table);
        process.stdout.write(helpContent.head + '\n');
        process.stdout.write(table.toString());
        process.stdout.write('\n\n');
    });
};

/**
 * General help contents
 *
 * @returns {*[]}
 */
async function getGeneralHelpContents() {
    return [
        getAllCommands(),
        {
            head: 'Configuration and Overrides:',
            table: [
                ['--knowledgeBaseID', 'Specifies the public qnamaker knowledgebase id. Overrides the .qnamakerrc value and the QNAMAKER_APP_ID environment variable.'],
                ['--subscriptionKey', 'Specifies the qnamaker subscription key (from qnamaker.ai portal user settings page). Overrides the .qnamakerrc value and the QNAMAKER_AUTHORING_KEY environment variable.'],
                ['--endpointBasePath', 'Specifies the base URI for all requests. Overrides the .qnamakerrc value and the QNAMAKER_ENDPOINT_BASE_PATH environment variable.'],
            ]
        },
        {
            head: 'Global Arguments:',
            table: [
                ['--help,    -h', 'Prints this help file.'],
                ['--version, -v', 'Prints the version of this cli tool']
            ]
        },
    ];
}

/**
 * Walks the qnamaker.json and pulls out all
 * commands that are supported.
 *
 * @returns {*[]}
 */
function getAllCommands() {
    const table = [];
    Object.keys(manifest).forEach(key => {
        const {[key]: group} = manifest;
        Object.keys(group.operations).forEach(operationName => {
            const operation = group.operations[operationName];
            table.push([operationName, chalk.cyan.bold(operation.command), operation.description]);
        });
    });
    return {
        head: chalk.cyan.bold('Supported operation names:'),
        table
    };
}
