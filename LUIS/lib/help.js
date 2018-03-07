const Table = require('cli-table2');
const chalk = require('chalk');

const manifest = require('./api/manifest');
const {getServiceManifest, getCategoryManifest, getCategoryName} = require('./utils/argsUtil');

module.exports = async function help(args) {
    const helpContents = await getHelpContents(args);
    let [x] = process.stdout.getWindowSize();
    process.stdout.write('\nLUIS cli for interacting with the LUIS api - © 2018 Microsoft Corporation\n\n');
    process.stdout.write(chalk.bold(`usage: luis [--help] [--!] [--init] ${chalk.cyan('<api group> <action> [<target> [<subtarget>] [--<args> ...]]]')}\n\n`));
    helpContents.forEach(helpContent => {
        const rows = helpContent.table[0].length;
        let i = rows - 1;
        const colWidthsFor2On = ((x * .85) - 22) / i;
        const colWidths = [22];

        while (i--) {
            colWidths.push(~~colWidthsFor2On);
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

async function getHelpContents(args) {
    if ('!' in args) {
        return getAllCommands();
    }

    const serviceManifest = getServiceManifest(args, true);
    const category = getCategoryManifest(args);
    const categoryName = getCategoryName(args);

    if (serviceManifest) {
        const targetHelpContents = getHelpContentsForTarget(serviceManifest);
        return categoryName === serviceManifest.key ? targetHelpContents.concat(getHelpContentsForCategory(category, categoryName)) : targetHelpContents;
    }

    if (category) {
        return getHelpContentsForCategory(category, categoryName);
    }

    return getGeneralHelpContents();
}

function getGeneralHelpContents() {
    return [
        {
            head: 'Commands:',
            table: [
                ['--help, -h', `Prints this help file. Use ${chalk.cyan.bold('<api group> [<target>] -h')} to see specific details on an <api group>`],
                ['--!', 'Dumps absolutely all documented commands to the console with descriptions'],
                ['--appId', 'Specifies the application id. This can optionally be specified in the .luisrc'],
                ['--versionId', 'Specifies the version id. This can optionally be specified in the .luisrc'],
                ['--init', 'Initializes the .luisrc file with settings specific to your LUIS instance'],
                ['--in <path>', 'Specifies the input file path. Applicable for create, update and patch actions'],
                ['--skip <int>', 'Specifies the number of records to skip. Applicable for the list action only'],
                ['--take <int>', 'Specifies the number of records to take. Applicable for the list action only'],
                ['--version', 'Prints the version of this cli tool']
            ]
        },

        {
            head: chalk.bold(` Where ${chalk.cyan('<api group>')} is one of the following:`),
            table: [
                ['apps', 'Adding, listing, exporting, publishing and updating LUIS apps'],
                ['examples', 'Adding, removing and updating labeled examples to the app'],
                ['features', 'Adding, removing, and updating pattern and phraselist feature info'],
                ['models', 'Interacting with LUIS models'],
                ['permissions', 'Interacting with access lists'],
                ['train', 'Retrieving training status or training the configured app version'],
                ['versions', 'Assigning, cloning, deleting, importing and exporting app versions'],
                ['', chalk.bold(`Use ${chalk.cyan('luis <api group> --help')} for details on a specific api group`)]
            ]
        },
        {
            head: chalk.bold(` Where ${chalk.cyan('<action>')} is one of the following:`),
            table: [
                ['get,    -g', 'Retrieves or reads the specified <target> or <subtarget> where applicable'],
                ['create, -c', 'Creates a new resource at the <target> or <subtarget> where applicable'],
                ['list,   -l', `Retrieves a list of <target> or <subtarget> ${chalk.cyan.bold('--skip')} and ${chalk.cyan.bold('--take')} pagination arguments are optional`],
                ['update, -u', 'Updates an existing resource at <target> or <subtarget> where applicable'],
                ['patch,  -p', 'Updates a partial resource at <target> or <subtarget> where applicable'],
                ['delete, -d', 'Deletes a resource at <target> or <subtarget> where applicable']
            ]
        }
    ];
}

function getAllCommands() {
    const table = [];
    Object.keys(manifest).forEach(key => {
        const {[key]: category} = manifest;
        Object.keys(category).forEach(categoryKey => {
            const {operations} = category[categoryKey];
            operations.forEach((operation, index) => {
                table.push([index ? '' : chalk.cyan.bold(categoryKey), chalk.cyan.bold(operation.command), operation.description]);
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

function getHelpContentsForTarget(serviceManifest) {
    const table = [];
    serviceManifest.operations.forEach(operation => {
        const subTarget = operation.subTarget ? ` ${chalk.bold('**Note**')} the ${chalk.cyan.bold('<subtarget>')} of ${chalk.bold(operation.subTarget)} must be used.` : '';
        table.push([operation.methodAlias, `${operation.description} ${subTarget} \nexample: ${chalk.cyan.bold(operation.command)}`]);
    });

    return [
        {
            head: chalk.bold(`Where ${chalk.cyan('<action>')} is one of the following`),
            table: table
        }
    ];
}

function getHelpContentsForCategory(category, categoryName) {
    return [{
        head: chalk.bold(`Where ${chalk.cyan('<target>')} is optionally one of the following:`),
        table: [
            [chalk.cyan.bold(`luis ${categoryName} <action> <target>`), Object.keys(category).filter(key => key !== categoryName).join(', ')],
            ['', chalk.bold(`Use ${chalk.cyan(`luis ${categoryName} <target> --help`)} for details on a specific target`)]
        ]
    }];
}
