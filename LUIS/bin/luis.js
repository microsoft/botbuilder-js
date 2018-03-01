global.fetch = require('node-fetch'); // Browser compatibility
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const luis = require('../lib');
const minimist = require('minimist');

async function runProgram() {
    const args = minimist(process.argv.slice(2));
    if (args.init) {
        await initializeConfig();
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
        location,
        appId,
        versionId,
        endpointBase: `https://${location}/api.cognitive.microsoft.com/luis/api/v2.0/`,
    });
    try {
        await new Promise((resolve, reject) => {
            prompt.question(`\n\nDoes this look ok?\n${JSON.stringify(config, null, 2)}\nYes/No: `, response => {
                (response || '').toLowerCase() === 'yes' ? resolve(response) : reject();
            });
        });
    } catch (e) {
        return null;
    }

    fs.writeJsonSync(path.join(process.cwd(), '.luisrc'), JSON.stringify(config, null, 2));
}

runProgram().then(() => process.exit(0));