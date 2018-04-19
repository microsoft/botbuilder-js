const Table = require('cli-table2');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const manifest = require('./api/qnamaker');

/**
 * Displays help content from the arguments.
 *
 * @returns {Promise<void>}
 */
module.exports = async function help(args, serviceManifest) {
    let x = 'getWindowSize' in process.stdout ? process.stdout.getWindowSize()[0] : 250;
    process.stdout.write('\nQnA Maker cli for interacting with the QnA Maker api - © 2018 Microsoft Corporation\n\n');
    let helpContents;
    if (serviceManifest) {
        process.stdout.write(`${serviceManifest.operation.description}\n\n`);
        process.stdout.write(`Usage:\n${chalk.cyan.bold(serviceManifest.operation.command)}\n\n`);
        helpContents = getHelpContentsForService(serviceManifest);
    }
    else {
        helpContents = await getGeneralHelpContents();
    }
    helpContents.forEach(helpContent => {
        const rows = helpContent.table[0].length;
        const colWidth = Math.floor(x / 4);
        const colWidths = [colWidth];
        if (rows === 2) {
            colWidths.push(~~((x * .95) - colWidth));
        }
        if (rows === 3) {
            colWidths.push(~~((x * .30) - colWidth / 2), ~~((x * .65) - colWidth / 2));
        }

        const table = new Table({
            // don't use lines for table
            chars: {
                'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
                'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
                'left': '', 'left-mid': '', 'right': '', 'right-mid': '',
                'mid': '', 'mid-mid': '', 'middle': ''
            },
            colWidths,
            style: { 'padding-left': 1, 'padding-right': 1 },
            wordWrap: true
        });
        table.push(...helpContent.table);
        process.stdout.write(chalk.white.bold(helpContent.head + '\n'));
        process.stdout.write(table.toString());
        process.stdout.write('\n\n');
    });
};

let configSection = {
    head: 'Configuration and Overrides:',
    table: [
        [chalk.cyan.bold('--kbid <kbid>'), 'Specifies the public qnamaker knowledgebase id. Overrides the .qnamakerrc value and the QNAMAKER_APP_ID environment variable.'],
        [chalk.cyan.bold('--subscriptionKey <key>'), 'Specifies the qnamaker subscription key (from qnamaker.ai portal user settings page). Overrides the .qnamakerrc value and the QNAMAKER_AUTHORING_KEY environment variable.'],
        [chalk.cyan.bold('--endpointBasePath <path>'), 'Specifies the base URI for all requests. Overrides the .qnamakerrc value and the QNAMAKER_ENDPOINT_BASE_PATH environment variable.'],
    ]
};

let globalArgs = {
    head: 'Global Arguments:',
    table: [
        [chalk.cyan.bold('--help,    -h'), 'Prints this help file.'],
        [chalk.cyan.bold('--version, -v'), 'Prints the version of this cli tool']
    ]
};

/**
 * General help contents
 *
 * @returns {*[]}
 */
async function getGeneralHelpContents() {
    return [
        getAllCommands(),
        configSection,
        globalArgs
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
        const { [key]: group } = manifest;
        Object.keys(group.operations).forEach(operationName => {
            const operation = group.operations[operationName];
            table.push([chalk.cyan.bold(operation.command), operation.description]);
        });
    });
    return {
        head: chalk.white.bold('Commands:'),
        table
    };
}

/**
 * Gets the help content for a target or sub target.
 *
 * @param {*} serviceManifest The manifest entry containing the operations
 * @param {string} categoryName The name of the category it belongs to
 * @param {string} targetName The name of the target (if present)
 * @param {string} subTargetName the name of the subTarget (if present)
 *
 * @returns {Array}
 */
function getHelpContentsForService(serviceManifest) {
    const { operation } = serviceManifest;
    const operations = serviceManifest.operation ? [operation] : serviceManifest.operations;

    const sections = [];
    // params table is shown only if we have a single
    // operation with 1 or more params.
    if (serviceManifest.operation) {
        if (serviceManifest.operation.params) {
            const { params } = operation;
            const paramsHelp = {
                head: `Command arguments are:`,
                table: params.map(param => [chalk.cyan.bold(`--${param.alias || param.name} <${param.type}>${param.required ? ' (required)' : ''}`), param.description])
            };
            if (operation.entityName) {
                paramsHelp.table.unshift([chalk.cyan.bold(`--in ${operation.entityType}.json`), `The ${operation.entityType} object to send in the body of the request`],
                    ['', chalk.dim(getEntityTypeExample(operation.entityType))]);
            }
            sections.push(paramsHelp);
        } else if (operation.entityName) {
            const paramsHelp = {
                head: `Command arguments are:`,
                table: [
                    [chalk.cyan.bold(`--in ${operation.entityType}.json`), `The ${operation.entityType} object to send in the body of the request`],
                    ['', chalk.dim(getEntityTypeExample(operation.entityType))]
                ]
            };
            sections.push(paramsHelp);
        }
    }
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
}


function getEntityTypeExample(entityType) {
    var examplePath = path.join(__dirname, `../examples/${entityType}.json`);
    let json = fs.readFileSync(examplePath, { encoding: 'utf8' }).replace(/[\r\f]+/g, '\n');
    return json;
}