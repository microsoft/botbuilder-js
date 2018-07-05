/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const Table = require('cli-table3');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');
const txtfile = require('read-text-file');
const manifest = require('./api/qnamaker');
const windowSize = require('window-size');
const { getServiceManifest } = require('../lib/utils/argsUtil');

/**
 * Displays help content from the arguments.
 *
 * @param args The arguments input by the user
 * @returns {Promise<void>}
 */
module.exports = async function help(args, output) {
    if (!output)
        output = process.stderr;

    output.write('QnA Maker Command line interface - © 2018 Microsoft Corporation\n\n');
    const helpContents = await getHelpContents(args, output);
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
        output.write(chalk.white.bold(helpContent.head + '\n'));
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
            output.write(table.toString());
        }
        output.write('\n\n');
    });
}

/**
 * Retrieves help content vie the qnamaker.json from
 * the arguments input by the user.
 *
* @param args The arguments input by the user
* @returns {Promise<*>}
*/
async function getHelpContents(args, output) {
    if ('!' in args) {
        return getAllCommands(output);
    }

    if (args._.length == 0) {
        return getGeneralHelpContents(output);
    }
    else if (args._.length == 1) {
        return getVerbHelp(args._[0], output);
    } else if (args._.length >= 2) {
        const serviceManifest = getServiceManifest(args);
        if (serviceManifest) {
            const { operation } = serviceManifest;

            output.write(`${operation.description}\n\n`);
            output.write(`Usage:\n${chalk.cyan.bold(operation.command)}\n\n`);
        } else {
            return getVerbHelp(args._[0], output);
        }
    }

    const serviceManifest = getServiceManifest(args);
    if (serviceManifest) {
        return getHelpContentsForService(serviceManifest, output);
    }

    return getGeneralHelpContents(output);
}


let configSection = {
    head: 'Configuration and Overrides:',
    table: [
        [chalk.cyan.bold('--subscriptionKey <key>'), 'Specifies the qnamaker subscription key/access keys (found on the Cognitive Services Azure portal page under "access keys"). Overrides the .qnamakerrc value and the QNAMAKER_SUBSCRIPTION_KEY environment variable.'],
        [chalk.cyan.bold('--hostname <url>'), 'Specifies the url for your private QnA service. Overrides the .qnamakerrc value and the QNAMAKER_HOSTNAME environment variable.'],
        [chalk.cyan.bold('--endpointKey <key>'), 'Specifies the endpoint key for your private QnA service.(from qnamaker.ai portal user settings page). Overrides the .qnamakerrc value and the QNAMAKER_ENDPOINTKEY environment variable.'],
        [chalk.cyan.bold('--kbId <kbId>'), 'Specifies the active qnamaker knowledgebase id. Overrides the .qnamakerrc value and the QNAMAKER_KBID environment variable.'],
    ]
};

let globalArgs = {
    head: 'Global Arguments:',
    table: [
        [chalk.cyan.bold('--help,    -h'), 'Prints this help file.'],
        [chalk.cyan.bold('--version, -v'), 'Prints the version of this cli tool'],
        [chalk.cyan.bold('--!          '), 'Dumps all documented commands to the console with descriptions']
    ]
};

/**
 * General help contents
 *
 * @returns {*[]}
 */
function getGeneralHelpContents(output) {
    let operation;
    let verbs = [];
    let options = {
        head: chalk.bold(`Available actions are:`),
        table: [
            [chalk.cyan.bold("create"), "create a resource"],
            [chalk.cyan.bold("delete"), "delete a resource"],
            [chalk.cyan.bold("export"), "export resources"],
            [chalk.cyan.bold("get"), "get a resource"],
            [chalk.cyan.bold('init'), 'Initializes the .qnamakerrc file with settings'],
            [chalk.cyan.bold("list"), "list resources"],
            [chalk.cyan.bold("publish"), "publish resource"],
            [chalk.cyan.bold("query"), "query model for prediction"],
            [chalk.cyan.bold("refresh"), "refresh resources"],
            [chalk.cyan.bold("set"), "change the .qnamakerrc settings"],
            [chalk.cyan.bold("update"), "update resources"],
            [chalk.cyan.bold("replace"), "replace a resource"]
            
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
function getVerbHelp(verb, output) {
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
            output.write(chalk.cyan.bold("qnamaker query --question <querytext>\n\n"));
            options.table.push([chalk.cyan.bold("--question <query>"), "query to get a prediction for"]);
            sections.push(options);
            sections.push(configSection);
            sections.push(globalArgs);
            return sections;

        case "set":
            output.write(chalk.cyan.bold("qnamaker set <.qnamakerrcSetting> <value>\n\n"));
            options.table.push([chalk.cyan.bold("kbid <kbid>"), "change the active knowledgebase id "]);
            options.table.push([chalk.cyan.bold("subscriptionkey <subscriptionkey>"), "change the active subscriptionkey"]);
            sections.push(options);
            sections.push(globalArgs);
            return sections;
        case "init":
            output.write(chalk.cyan.bold("qnamaker init\n\n"));
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
        return getGeneralHelpContents(output);

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
    let resourceTypes = [];
    let tables = {};
    Object.keys(manifest).forEach(key => {
        const { [key]: category } = manifest;
        Object.keys(category.operations).forEach((operationKey, index) => {
            let operation = category.operations[operationKey];
            let opCategory = operation.target[0] || operation.methodAlias;
            if (resourceTypes.indexOf(opCategory) < 0) {
                resourceTypes.push(opCategory);
                tables[opCategory] = [];
            }
            tables[opCategory].push([chalk.cyan.bold(operation.command), operation.description]);
        });
    });

    resourceTypes.sort();

    let sections = [];
    for (resourceType of resourceTypes) {
        tables[resourceType].sort((a, b) => a[0].localeCompare(b[0]));
        sections.push({
            head: chalk.white.bold(resourceType),
            table: tables[resourceType]
        });
    }

    return sections;
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
function getHelpContentsForService(serviceManifest, output) {
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
        if (operation.name == 'createKnowledgebase' || operation.name == 'getKnowledgebaseDetails') {
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
        let json = txtfile.readSync(examplePath).replace(/[\r\f]+/g, '\n');
        return json;
    } catch (error) {
        return `{/*example for ${entityType} missing*/}`;
    }
}