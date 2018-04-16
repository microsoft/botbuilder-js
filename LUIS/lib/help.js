const Table = require('cli-table2');
const chalk = require('chalk');

const manifest = require('./api/luis');
const { getServiceManifest, getCategoryManifest, getNamedArgsMap } = require('./utils/argsUtil');

/**
 * Displays help content from the arguments.
 *
 * @param args The arguments input by the user
 * @returns {Promise<void>}
 */
module.exports = async function help(args) {

    let x = 'getWindowSize' in process.stdout ? process.stdout.getWindowSize()[0] : 50;
    process.stdout.write('LUIS Command Line Interface - © 2018 Microsoft Corporation\n\n');
    const helpContents = await getHelpContents(args);

    helpContents.forEach(helpContent => {
        const rows = helpContent.table[0].length;
        let i = rows - 1;
        const leftColWidth = 40;
        const colWidthsFor2On = ((x * .85) - leftColWidth) / i;
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
        process.stdout.write(helpContent.head + '\n');
        process.stdout.write(table.toString());
        process.stdout.write('\n\n');
    });
}

/**
 * Retrieves help content vie the luis.json from
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
            process.stdout.write(`Usage:\n${chalk.bold(operation.command)}\n\n`);
        } else 
        {
            return getVerbHelp(args._[0]);
        }
    }

    const category = getCategoryManifest(args);
    const serviceManifest = getServiceManifest(args);
    if (serviceManifest) {
        return getHelpContentsForService(serviceManifest);
    }

    return getGeneralHelpContents();
}
let configSection = {
    head: 'Configuration and Overrides:',
    table: [
        ['--appId', 'Specifies the public LUIS application id. Overrides the .luisrc value and the LUIS_APP_ID environment variable.'],
        ['--authoringKey', 'Specifies the LUIS authoring  key (from luis.ai portal user settings page). Overrides the .luisrc value and the LUIS_AUTHORING_KEY environment variable.'],
        ['--versionId', 'Specifies the version id. Overrides the .luisrc value and the LUIS_VERSION_ID environment variable.'],
        ['--endpointBasePath', 'Specifies the base URI for all requests. Overrides the .luisrc value and the LUIS_ENDPOINT_BASE_PATH environment variable.'],
    ]
};

let globalArgs = 
{
    head: 'Global Arguments:',
    table: [
        ['--help,    -h', `Prints this help file. `],
        ['--!          ', 'Dumps absolutely all documented commands to the console with descriptions'],
        ['--init,    -i', 'Initializes the .luisrc file with settings specific to your LUIS instance'],
        ['--version, -v', 'Prints the version of this cli tool']
    ]
};


/**
 * General help contents
 *
 * @returns {*[]}
 */
function getGeneralHelpContents() {
    let operation;
    let apiGroups = ['apps', 'examples', 'features', 'models', 'permissions', 'train', 'user', 'versions']
    let verbs = [];
    let options = {
        head: chalk.bold(`Available actions are:`),
        table: [
            ["add", "add a resource"],
            ["clone", "clone a resource"],
            ["delete", "delete a resource"],
            ["export", "export resources"],
            ["get", "get a resource"],
            ["import", "import resources"],
            ["list", "list resources"],
            ["publish", "publish resource"],
            ["suggest", "suggest resources"],
            ["train", "train resource"],
            ["update", "update resources"]
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
    let apiGroups = ['apps', 'examples', 'features', 'models', 'permissions', 'train', 'user', 'versions']
    let targets = [];
    let options = {
        head: `Available resources for ${chalk.bold(verb)}:`,
        table: []
    };

    for (let iGroup in apiGroups) {
        let apiGroupName = apiGroups[iGroup];
        const apiGroup = getCategoryManifest(apiGroupName);

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
        return getGeneralHelpContents();

    targets.sort();
    for (let verb of targets) {
        options.table.push([verb, '']);
    }
    let sections = [];
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
function getAllCommands() {
    const table = [];
    Object.keys(manifest).forEach(key => {
        const { [key]: category } = manifest;
        Object.keys(category).forEach(categoryKey => {
            const { operations } = category[categoryKey];
            operations.forEach((operation, index) => {
                let opCategory = operation.target[0];
                if (opCategory[opCategory.length-1] == 's')
                    opCategory = opCategory.substring(0, opCategory.length-1);
                table.push([index ? '' : chalk.white.bold(opCategory), chalk.cyan.bold(operation.command), operation.description]);
            });
        });
    });
    return [
        {
            head: chalk.cyan.bold('All documented commands:'),
            table
        }
    ];
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
    if (serviceManifest.operation && serviceManifest.operation.params) {
        const { operation } = serviceManifest;
        const { params } = operation;
        const paramsHelp = {
            head: `Command arguments are:`,
            table: params.map(param => [`--${param.name} <${param.type}>${param.required ? ' (required)' : ''}`, param.description])
        };
        if (operation.entityName) {
            paramsHelp.table.unshift(['--in (required)', `The ${operation.entityType} object to send in the body of the request`]);
        }
        sections.push(paramsHelp);
    }
    sections.push(configSection);
    sections.push(globalArgs);
    return sections;
}

// /**
//  * Gets the help content for a named category, a.k.a. <api group>
//  *
//  * @param {*} category The category containing the manifests for each target within it.
//  * @param {string} categoryName The name of the category
//  *
//  * @returns {*[]}
//  */
// function getHelpContentsForCategory(category, categoryName) {
//     return [{
//         head: chalk.bold(`Valid ${chalk.cyan('<subgroup>')} is one of the following:`),
//         table: [
//             [chalk.cyan.bold(`luis ${categoryName} [<subgroup>] <action> `), Object.keys(category).filter(key => key !== categoryName).join(', ')],
//             ['', chalk.bold(`Use ${chalk.cyan(`luis ${categoryName} <subgroup> --help`)} for details on a specific target`)]
//         ]
//     }];
// }

// /**
//  * Gets the help content for the named <subtarget>
//  *
//  * @param {{}[]} operations An array of operations that contain the named subtarget
//  * @param {string} categoryName The name of the category owning the subtarget
//  * @param {string} targetName The name of the target owning the subtarget
//  *
//  * @returns {{head: *|string, table: *[]}}
//  */
// function getHelpForSubTargets(operations, categoryName, targetName) {
//     // Since subtargets are derived from operations, there could be
//     // duplicates if a subtarget has more than one operation associated with it.
//     const operationNameMap = {};
//     operations = operations.filter(op => {
//         if (!operationNameMap[op.subTarget]) {
//             operationNameMap[op.subTarget] = true;
//             return true;
//         }
//         return false;
//     });
//     return {
//         head: chalk.bold(`Valid ${chalk.cyan('<subgroup>')} are:`),
//         table: [
//             [chalk.cyan.bold(`luis ${categoryName} ${targetName} [<subgroup>] <action>`), operations.map(operation => operation.subTarget).join(', ')],
//             ['', chalk.bold(`Use ${chalk.cyan(`luis ${categoryName} ${targetName} [<subgroup>] --help`)} for details on a specific subtarget`)]
//         ]
//     };
// }

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