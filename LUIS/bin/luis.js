global.fetch = require('node-fetch'); // Browser compatibility
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const minimist = require('minimist');
const chalk = require('chalk');
const help = require('../lib/help');
const luis = require('../lib');

async function runProgram() {
    const args = minimist(process.argv.slice(2));
    if (args.init) {
        return initializeConfig();
    }
    if (args.help) {
        const helpContents = await help(args);
        debugger
    }
    try {
        const config = await fs.readJson(path.join(process.cwd(), '.luisrc'));
        return luis(config);
    } catch (e) {
        throw new Error('.luisrc file not found. Run luis --init to create the configuration file.');
    }
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
        endpointBase: `https://${location}/api.cognitive.microsoft.com/luis/api/v2.0/`,
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

    fs.writeJsonSync(path.join(process.cwd(), '.luisrc'), JSON.stringify(config, null, 2));
}
function exitWithError(error) {
    if (error instanceof Error) {
        process.stdout.write(chalk.red(error));
    } else {
        help();
    }
    process.exit(1);
}
runProgram().then(() => process.exit(0)).catch(exitWithError);