/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const Table = require('cli-table3');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const txtfile = require('read-text-file');
const manifest = require('./api/luis');
const windowSize = require('window-size');
const { getServiceManifest, getCategoryManifest, getNamedArgsMap } = require('./utils/argsUtil');

/**
 * Displays help content from the arguments.
 *
 * @param args The arguments input by the user
 * @returns {Promise<void>}
 */
module.exports = async function help(args, output) {
    if (!output)
        output = process.stderr;

    output.write('LUIS Command Line Interface - © 2018 Microsoft Corporation\n\n');
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
 * Retrieves help content vie the luis.json from
 * the arguments input by the user.
 *
* @param args The arguments input by the user
* @returns {Promise<*>}
*/
async function getHelpContents(args, output) {
    if ('!' in args) {
        return getAllCommands(process.stdout);
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
        [chalk.cyan.bold('--appId'), 'Specifies the public LUIS application id. Overrides the .luisrc value and the LUIS_APP_ID environment variable.'],
        [chalk.cyan.bold('--authoringKey'), 'Specifies the LUIS authoring  key (from luis.ai portal user settings page). Overrides the .luisrc value and the LUIS_AUTHORING_KEY environment variable.'],
        [chalk.cyan.bold('--versionId'), 'Specifies the version id. Overrides the .luisrc value and the LUIS_VERSION_ID environment variable.'],
        [chalk.cyan.bold('--endpointBasePath'), 'Specifies the base URI for all requests. Overrides the .luisrc value and the LUIS_ENDPOINT_BASE_PATH environment variable.'],
    ]
};

let globalArgs =
    {
        head: 'Global Arguments:',
        table: [
            [chalk.cyan.bold('--help,    -h'), `Prints this help file. `],
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
            [chalk.cyan.bold("add"), "add a resource"],
            [chalk.cyan.bold("clone"), "clone a resource"],
            [chalk.cyan.bold("delete"), "delete a resource"],
            [chalk.cyan.bold("export"), "export resources"],
            [chalk.cyan.bold("get"), "get a resource"],
            [chalk.cyan.bold("import"), "import resources"],
            [chalk.cyan.bold('init'), 'Initializes the .luisrc file with settings specific to your LUIS instance'],
            [chalk.cyan.bold("list"), "list resources"],
            [chalk.cyan.bold("publish"), "publish resource"],
            [chalk.cyan.bold("query"), "query model for prediction"],
            [chalk.cyan.bold("set"), "change the .luisrc settings"],
            [chalk.cyan.bold("suggest"), "suggest resources"],
            [chalk.cyan.bold("train"), "train resource"],
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
            output.write(chalk.cyan.bold("luis query -q <querytext> --region <region>\n\n"))
            options.table.push([chalk.cyan.bold("-q <query>"), "query to get a LUIS prediction for"]);
            options.table.push([chalk.cyan.bold("--subscriptionKey"), "Specifies the LUIS subscriptionKey. Overrides the .luisrc value and the LUIS_SUBSCRIPTION_KEY environment variable."]);
            options.table.push([chalk.cyan.bold("--region <region>"), "region to call"]);
            sections.push(options);
            sections.push(configSection);
            sections.push(globalArgs);
            return sections;

        case "set":
            output.write(chalk.cyan.bold("luis set <appIdOrName> [--appId|--versionId|--authoringKey|--endpoint] <value>\n\n"))
            options.table.push([chalk.cyan.bold("<appIdOrName>"), "change the active application by looking it up by name or id"]);
            options.table.push([chalk.cyan.bold("--appId <appId>"), "change the active application id "]);
            options.table.push([chalk.cyan.bold("--versionId <version>"), "change the active version id "]);
            options.table.push([chalk.cyan.bold("--authoringKey <authoringKey>"), "change the active authoringKey◘"]);
            options.table.push([chalk.cyan.bold("--endpoint <endpointUrl>"), "change the active endpointBasePath url"]);
            sections.push(options);
            sections.push(configSection);
            sections.push(globalArgs);
            return sections;
    }

    for (let iGroup in manifest) {
        const apiGroup = manifest[iGroup];

        for (let iCategory in apiGroup) {
            let category = apiGroup[iCategory];

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
    }


    if (targets.length == 0)
        return getGeneralHelpContents(output);

    targets.sort();
    for (let target of targets) {
        options.table.push([chalk.cyan.bold(target), '']);
    }
    sections.push(options);
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
}


/**
 * Walks the luis.json and pulls out all
 * commands that are supported.
 *
 * @returns {*[]}
 */
function getAllCommands(output) {
    const table = [];
    let resourceTypes = [];
    let tables = {};
    Object.keys(manifest).forEach(key => {
        const { [key]: category } = manifest;
        Object.keys(category).forEach(categoryKey => {
            const { operations } = category[categoryKey];
            operations.forEach((operation, index) => {
                let opCategory = operation.target[0];
                if (resourceTypes.indexOf(opCategory) < 0) {
                    resourceTypes.push(opCategory);
                    tables[opCategory] = [];
                }
                tables[opCategory].push([chalk.cyan.bold(operation.command), operation.description]);
            });
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
                table: params.map(param => [chalk.cyan.bold(`--${param.name} <${param.type}>${param.required ? ' (required)' : ''}`), param.description])
            };
            if (operation.entityName) {
                paramsHelp.table.unshift([chalk.cyan.bold('--in (required)'), `The object to send in the body of the request`],
                    ['', chalk.dim(getEntityTypeExample(operation.entityType))]);
            }
        } else if (operation.entityName) {
            paramsHelp = {
                head: `Command arguments are:`,
                table: [
                    [chalk.cyan.bold('--in (required)'), `The object to send in the body of the request`],
                    ['', chalk.dim(getEntityTypeExample(operation.entityType))]
                ]
            };
        }
        switch (operation.target[0]) {
            case 'application':
                switch (operation.methodAlias) {
                    case 'add':
                    case 'import':
                    case "get":
                        paramsHelp.table.push([chalk.cyan.bold(`--msbot`), `(OPTIONAL) Format the output as json for piping into msbot connect luis command`]);
                        break;
                }
                break;
        }
        sections.push(paramsHelp);
    }
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
}

function getEntityTypeExample(entityType) {
    var examplePath = path.join(__dirname, `../examples/${entityType}.json`);
    let json = txtfile.readSync(examplePath).replace(/[\r\f]+/g, '\n');
    return json;
}


/**
 * Gets the help content for an operation
 *
 * @param {*} operation The operation to display the help contents for
 *
 * @returns {*[]}
 */
function getHelpForOperation(operation) {
    const { methodAlias, command, description } = operation;
    return [`${chalk.cyan.bold(command)}`, `${description}`];
}