global.fetch = require('node-fetch'); // Browser compatibility
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const minimist = require('minimist');
const chalk = require('chalk');

const help = require('../lib/help');
const luis = require('../lib');
const getServiceManifestFromArguments = require('../lib/utils/getServiceManifestFromArguments');

async function runProgram() {
    const args = minimist(process.argv.slice(2));

    if (args.init) {
        await initializeConfig();
        process.stdout.write(`Successfully wrote ${process.cwd()}.luisrc`);
        return;
    }
    if (args.help) {
        return help(args);
    }
    let config;
    try {
        config = await fs.readJson(path.join(process.cwd(), '.luisrc'));
    } catch (e) {
        throw new Error('.luisrc file not found. Run luis --init to create the configuration file.');
    }

    const serviceManifest = getServiceManifestFromArguments(args);
    validateArguments(args, serviceManifest);

    const requestBody = await getFileInput(args);
    const result = await luis(config, serviceManifest, args, requestBody);
    debugger;
}

async function initializeConfig() {
    process.stdout.write('This util will walk you through creating a .luisrc file\n\nPress ^C at any time to quit.\n\n');
    const questions = [
        'Subscription key: ',
        'Region: ',
        'App ID: ',
        'Version ID: '
    ];

    const prompt = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const answers = [];
    for (let question of questions) {
        const answer = await new Promise((resolve) => {
            prompt.question(question, response => {
                resolve(response);
            });
        });
        answers.push(answer);
    }

    const [subscriptionKey, location, appId, versionId] = answers;
    const config = Object.assign({}, {
        subscriptionKey,
        appId,
        versionId,
        endpointBasePath: `https://${location}.api.cognitive.microsoft.com/luis/api/v2.0`,
    });
    try {
        await new Promise((resolve, reject) => {
            const confirmation = `\n\nDoes this look ok?\n${JSON.stringify(config, null, 2)}\nYes/No: `;
            prompt.question(confirmation, response => {
                (response || '').toLowerCase() === 'yes' ? resolve(response) : reject();
            });
        });
    } catch (e) {
        return null;
    }

    return fs.writeJson(path.join(process.cwd(), '.luisrc'), config);
}

async function getFileInput(args) {
    if (typeof args.in !== 'string') {
        return null;
    }
    // Let any errors fall through to the runProgram() promise
    return await fs.readJson(path.resolve(args.in));
}

function validateArguments(args, serviceManifest) {
    if (!serviceManifest) {
        throw new ReferenceError('The service does not exist');
    }

    if (typeof serviceManifest.operationName === 'boolean') {
        throw new Error('An operation must be specified');
    }

    const {operationDetail} = serviceManifest;
    const entitySpecified = typeof args.in === 'string';
    const entityRequired = !!operationDetail.entityName;

    if (!entityRequired && entitySpecified) {
        throw new Error(`The ${operationDetail.name} operation does not accept an input`);
    }

    if (entityRequired && !entitySpecified) {
        throw new Error(`The ${operationDetail.name} requires an input of type: ${operationDetail.entityType}`);
    }

    // Note that the ServiceBase will validate params that may be required.
}

function exitWithError(args) {
    if (args instanceof Error) {
        process.stdout.write(chalk.red(args));
        process.stdout.write(chalk.green('Type --help for a list of commands.'));
    } else {
        help(args);
    }
    process.exit(1);
}

runProgram()
    .then(process.exit)
    .catch(exitWithError);