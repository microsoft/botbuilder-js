const Table = require('cli-table2');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const manifest = require('./api/qnamaker');
const windowSize = require('window-size');
const { getServiceManifest } = require('../lib/utils/argsUtil');

/**
 * Displays help content from the arguments.
 *
 * @param args The arguments input by the user
 * @returns {Promise<void>}
 */
module.exports = async function help(args) {

    process.stdout.write('QnA Maker Command line interface - © 2018 Microsoft Corporation\n');
    const helpContents = await getHelpContents(args);
    let width = windowSize ? windowSize.width : 250;

    let leftColWidth = 0;
    for (let hc of helpContents) {
        if (hc.table && hc.table[0].length > 0) {
            const rows = hc.table[0].length;
            for (let row in hc.table) {
                let len = hc.table[row][0].length;
                if (len > leftColWidth) {
                    leftColWidth = Math.min(len, Math.floor(width / 3));
                }
            }
            let i = rows - 1;
        }
    }

    helpContents.forEach(helpContent => {
        process.stdout.write(chalk.white.bold(helpContent.head + '\n'));
        if (helpContent.table && helpContent.table[0].length > 0) {
            const rows = helpContent.table[0].length;
            let i = rows - 1;

            const colWidthsFor2On = ((width * .85) - leftColWidth) / i;
            const colWidths = [leftColWidth];

            while (i--) {
                colWidths.push(~~colWidthsFor2On);
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
            process.stdout.write(table.toString());
        }
        process.stdout.write('\n\n');
    });
}

/**
 * Retrieves help content vie the qnamaker.json from
 * the arguments input by the user.
 *
* @param args The arguments input by the user
* @returns {Promise<*>}
*/
async function getHelpContents(args) {
    if ('!' in args) {
        return getAllCommands();
    }

    if (args._.length == 0) {
        return getGeneralHelpContents();
    }
    else if (args._.length == 1) {
        return getVerbHelp(args._[0]);
    } else if (args._.length >= 2) {
        const serviceManifest = getServiceManifest(args);
        if (serviceManifest) {
            const { operation } = serviceManifest;

            process.stdout.write(`${operation.description}\n\n`);
            process.stdout.write(`Usage:\n${chalk.cyan.bold(operation.command)}\n\n`);
        } else {
            return getVerbHelp(args._[0]);
        }
    }

    const serviceManifest = getServiceManifest(args);
    if (serviceManifest) {
        return getHelpContentsForService(serviceManifest);
    }

    return getGeneralHelpContents();
}


let configSection = {
    head: 'Configuration and Overrides:',
    table: [
        [chalk.cyan.bold('--kbId <kbId>'), 'Specifies the public qnamaker knowledgebase id. Overrides the .qnamakerrc value and the QNAMAKER_KBID environment variable.'],
        [chalk.cyan.bold('--subscriptionKey <key>'), 'Specifies the qnamaker ocp-apim-subscription key (from qnamaker.ai portal user settings page). Overrides the .qnamakerrc value and the QNAMAKER_SUBSCRIPTION_KEY environment variable.'],
        [chalk.cyan.bold('--endpoint <path>'), 'Specifies the api endpoint for your QnA service. Overrides the .qnamakerrc value and the QNAMAKER_ENDPOINT environment variable.'],
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
function getGeneralHelpContents() {
    let operation;
    let verbs = [];
    let options = {
        head: chalk.bold(`Available actions are:`),
        table: [
            [chalk.cyan.bold("create"), "create a resource"],
            [chalk.cyan.bold("delete"), "delete a resource"],
            [chalk.cyan.bold("export"), "export resources"],
            [chalk.cyan.bold("get"), "get a resource"],
            [chalk.cyan.bold("list"), "list resources"],
            [chalk.cyan.bold("publish"), "publish resource"],
            [chalk.cyan.bold("query"), "query model for prediction"],
            [chalk.cyan.bold("refresh"), "refresh resources"],
            [chalk.cyan.bold("set"), "change the .qnamakerrc settings"],
            [chalk.cyan.bold("update"), "update resources"]
        ]
    };

    let sections = [];
    sections.push(options);
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
}

/**
 * General verb help contents
 *
 * @returns {*[]}
 */
function getVerbHelp(verb) {
    let operation;
    let targets = [];
    let options = {
        head: `Available resources for ${chalk.bold(verb)}:`,
        table: []
    };

    // special verbs
    let sections = [];
    switch (verb) {
        case "query":
            process.stdout.write(chalk.cyan.bold("qnamaker query --question <querytext>\n\n"))
            options.table.push([chalk.cyan.bold("--question <query>"), "query to get a prediction for"]);
            sections.push(options);
            sections.push(configSection);
            sections.push(globalArgs);
            return sections;

        case "set":
            process.stdout.write(chalk.cyan.bold("qnamaker set <.qnamakerrcSetting> <value>\n\n"))
            options.table.push([chalk.cyan.bold("kbid <kbid>"), "change the active knowledgebase id "]);
            options.table.push([chalk.cyan.bold("subscriptionkey <subscriptionkey>"), "change the active subscriptionkey"]);
            options.table.push([chalk.cyan.bold("endpoint <endpointUrl>"), "change the active endpoint url"]);
            sections.push(options);
            sections.push(configSection);
            sections.push(globalArgs);
            return sections;
    }

    for (let apiGroupName in manifest) {
        const category = manifest[apiGroupName];

        for (let iOperation in category.operations) {
            let operation = category.operations[iOperation];
            if (operation.methodAlias == verb) {
                let target = operation.target[0];
                if (targets.indexOf(target) < 0) {
                    targets.push(target);
                }
            }
        }
    }

    if (targets.length == 0)
        return getGeneralHelpContents();

    targets.sort();
    for (let verb of targets) {
        options.table.push([chalk.cyan.bold(verb), '']);
    }
    sections.push(options);
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
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
        let paramsHelp = { head: '', table: [] };
        if (serviceManifest.operation.params) {
            const { params } = operation;
            paramsHelp = {
                head: `Command arguments are:`,
                table: params.map(param => [chalk.cyan.bold(`--${param.alias || param.name} <${param.type}>${param.required ? ' (required)' : ''}`), param.description])
            };
            if (operation.entityName) {
                paramsHelp.table.unshift([chalk.cyan.bold(`--in ${operation.entityType}.json`), `The ${operation.entityType} object to send in the body of the request`],
                    ['', chalk.dim(getEntityTypeExample(operation.entityType))]);
            }
        } else if (operation.entityName) {
            paramsHelp = {
                head: `Command arguments are:`,
                table: [
                    [chalk.cyan.bold(`--in ${operation.entityType}.json`), `The ${operation.entityType} object to send in the body of the request`],
                    ['', chalk.dim(getEntityTypeExample(operation.entityType))]
                ]
            };
        }
        if (operation.name == 'createKnowledgeBase') {
//            paramsHelp.table.push([chalk.cyan.bold(`-q, --quiet`), `(OPTIONAL) disable prompt for saving to .qnamakerrc file`]);
            paramsHelp.table.push([chalk.cyan.bold(`--msbot`), `(OPTIONAL) Format the output as json for piping into msbot connect qna command`]);
        }
        if (paramsHelp.table.length > 0)
            sections.push(paramsHelp);
    }
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
}


function getEntityTypeExample(entityType) {
    try {
        var examplePath = path.join(__dirname, `../examples/${entityType}.json`);
        let json = fs.readFileSync(examplePath, { encoding: 'utf8' }).replace(/[\r\f]+/g, '\n');
        return json;
    } catch (error) {
        return `{/*example for ${entityType} missing*/}`;
    }
}