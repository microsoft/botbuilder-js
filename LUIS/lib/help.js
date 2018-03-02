const manifest = require('./api/manifest');
const Table = require('cli-table2');
const cc = require('camelcase');

const getServiceManifestFromArguments = require('./utils/getServiceManifestFromArguments');

module.exports = async function help(args) {
    const helpContents = await getHelpContents(args);
    let [x] = process.stdout.getWindowSize();
    const table = new Table({
        head: ['Argument', 'Description'],
        colWidths: [null, x * .5],
        style: {head: ['green'], 'padding-left': 1, 'padding-right': 1},
        wordWrap: true
    });
    table.push(...helpContents);
    process.stdout.write('\nLUIS cli for interacting with the LUIS api - © 2018 Microsoft Corporation\n\nUsage:\n');
    process.stdout.write(table.toString());
};

async function getHelpContents(args) {
    delete args._;
    delete args.help;
    const serviceManifest = getServiceManifestFromArguments(args);
    const {operationDetail, operations, serviceName} = (serviceManifest || {});
    if (operationDetail) {
        return [{[getCommandExampleForOperation(serviceName, operationDetail)]: operationDetail.description}];
    }
    else if (serviceName) {
        return getCommandExamplesForService(serviceName, operations);
    }
    return getGeneralHelpContents();
}

function getGeneralHelpContents() {
    return [
        {'': 'For help on a specific command, use: --<command> --help'},
        {'--init': 'Initializes the .luisrc file with settings specific to your LUIS instance'}
    ].concat(Object.keys(manifest)
        .sort()
        .map(key => ({[`--${key}`]: `Operations:${manifest[key].operations.map(operation => ` ${operation.name.trim()}`)}`})));
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

function getCommandExamplesForService(serviceName, operations) {
    return operations.map(operation => ({[getCommandExampleForOperation(serviceName, operation)]: operation.description}));
}