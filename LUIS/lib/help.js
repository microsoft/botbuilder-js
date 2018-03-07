const manifest = require('./api/manifest');
const Table = require('cli-table2');
const cc = require('camelcase');

const {getServiceManifestFromArguments, getCategoryFromArguments} = require('./utils/getServiceManifestFromArguments');

module.exports = async function help(args) {
    const helpContents = await getHelpContents(args);
    let [x] = process.stdout.getWindowSize();
    process.stdout.write('\nLUIS cli for interacting with the LUIS api - © 2018 Microsoft Corporation\n\n' +
        'Usage: luis [--help] [--init] <api group> <action> [<target> [<subtarget> [--<args>]]]\n');

    helpContents.forEach(helpContent => {
        const table = new Table({
            head: helpContent.head,
            colWidths: [22, Math.floor(x * .6)],
            style: {head: ['green'], 'padding-left': 1, 'padding-right': 1},
            wordWrap: true
        });

        table.push(...helpContent.table);
        process.stdout.write(table.toString());
        process.stdout.write('\n');
    });
};

async function getHelpContents(args) {
    const serviceManifest = getServiceManifestFromArguments(args, true);
    const {operation} = (serviceManifest || {});
    if (operation) {
        return getCommandExampleForOperation(operation);
    }

    const category = getCategoryFromArguments(args);
    if (category) {
        const [categoryName] = args._ || [];
        return getCommandExamplesForCategory(category, categoryName);
    }
    return getGeneralHelpContents();
}

function getGeneralHelpContents() {
    return [
        {
            head: ['', 'usage: luis [--help] [--init] <api group> <action> [<target> [<subtarget> [--<args>]]]'],
            table: [
                {'[<api group>] --help': 'Provides help on the commands for the api group (if specified)'},
                {'--init': 'Initializes the .luisrc file with settings specific to your LUIS instance'},
                {'--version': 'Prints the version of this cli tool'}
            ]
        },

        {
            head: ['', 'where <api group> is one of the following:'],
            table: [
                {apps: 'Adding, listing, exporting, publishing and updating LUIS apps'},
                {examples: 'Adding, removing and updating labeled examples to the app'},
                {features: 'Adding, removing, and updating pattern and phraselist feature info'},
                {models: 'Interacting with LUIS models'},
                {permissions: 'Interacting with access lists'},
                {train: 'Retrieving training status or training the configured app version'},
                {user: 'Adding, removing, and updating user related data'},
                {versions: 'Assigning, cloning, deleting, importing and exporting app versions'},
                {'': 'Use "<api group> --help" for more details)'}
            ]
        },
        {
            head: ['', 'Where <action> is one of the following:'],
            table: [
                {'get    or -g': 'Retrieves or reads the specified <target> or <subtarget> where applicable'},
                {'create or -c': 'Creates a new resource at the <target> or <subtarget> where applicable'},
                {'list   or -l': 'Retrieves a list of <target> or <subtarget> --skip and --take pagination arguments are optional'},
                {'update or -u': 'Updates an existing resource at <target> or <subtarget> where applicable'},
                {'patch  or -p': 'Updates a partial resource at <target> or <subtarget> where applicable'},
                {'delete or -d': 'Deletes a resource at <target> or <subtarget> where applicable'}
            ]
        }
    ];
}

function getCommandExampleForOperation(serviceName, operationDetail) {
    let cmd = '';
    if (operationDetail.entityType) {
        cmd += `--in [path to ${operationDetail.entityType}] `;
    }
    cmd += `--${serviceName} ${operationDetail.name}`;
    (operationDetail.params || []).forEach(param => {
        cmd += ` --${param.name} <${cc(param.name + ' ' + param.type)}>`;
    });
    return cmd;
}

function getCommandExamplesForCategory(category, categoryName) {
    const helpContents = [{
        head: ['Command', 'Where <target> is optionally one of the following:'],
        table: [{[`luis ${categoryName} <target>`]: Object.keys(category).filter(key => key !== categoryName).join(', ')}]
    }];
    return helpContents;
}
