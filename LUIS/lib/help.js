const manifest = require('./api/manifest');
const Table = require('cli-table2');

module.exports = async function help(args) {
    const helpContents = await getHelpContents(args);
    let [x] = process.stdout.getWindowSize() ;
    let left = 16;
    let right = x-left-3; // 3 is for 3 vertical bar characters
    const table = new Table({
        head: ['Argument', 'Description'],
        colWidths: [left, right],
        style: {head: ['green'], 'padding-left': 1, 'padding-right': 1},
        wordWrap: true
    });
    table.push(...helpContents);
    process.stdout.write('\nLUIS cli for interacting with the LUIS api\n\n© 2018 Microsoft Corporation\n\nUsage:\n\n');
    process.stdout.write(table.toString());
};

async function getHelpContents(args) {
    delete args._;
    delete args.help;
    const argNames = Object.keys(args || {});

    for (let i = 0; i < argNames.length; i++) {
        const serviceName = argNames[i];
        const service = manifest[serviceName];
        const operationName = args[serviceName];

        if (service && operationName) {
            const operationDetails = (service.operations || []).find(operation => operation.name === operationName);
            if (!operationDetails) {
                break;
            }
            return operationDetails.map(operationDetail => {
                return {[getCommandExampleForOperation(serviceName, operationDetail)]: operationDetail.description};
            });
        } else if (service) {
            return getCommandExamplesForService(serviceName, service);
        }
    }
    return getGeneralHelpContents();
}

function getGeneralHelpContents() {
    return Object.keys(manifest)
        .sort()
        .map(key => {
            return {[`--${key}`]: `Operations:${manifest[key].operations.map(operation => ` ${operation.name}`)}`};
        }).concat({'': 'For help on a specific command, use --<command> --help'});
}

function getCommandExampleForOperation(serviceName, operationDetail) {
    let cmd = '';
    if (operationDetail.entityType) {
        cmd += `--in [path to ${operationDetail.entityType}]`;
    }
    return cmd + `--${serviceName} ${operationDetail.name}'`;
}

function getCommandExamplesForService(serviceName, service) {
    service.operations.map(operation => {
        return {[getCommandExampleForOperation(serviceName, operation)]: operation.description};
    });
}