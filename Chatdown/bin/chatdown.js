const chatdown = require('../lib/chatdown');

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

async function resolveConfigs() {
    const chatdownArgs = require('minimist')(process.argv.slice(2));
    let config;
    try {
        config = JSON.parse(fs.readFileSync(path.resolve((chatdownArgs.config || '.chatrc'))));
    }
    catch (e) {
        if (chatdownArgs.config !== undefined) {
            throw new ReferenceError(`${chatdownArgs.config} cannot be found`);
        }
        config = {};
    }
    return Object.assign(config, chatdownArgs);
}

function getInput(config) {
    if (!config.in) {
        return new Promise((resolve, reject) => {
            const { stdin } = process;
            let input = '';
            stdin.setEncoding('utf8');
            stdin.on(data, _chunks => {
                input += _chunks;
            });
            stdin.on('end', () => resolve(input));
            stdin.on('error', error => reject(error))
        });
    }
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(config.in), 'utf-8', (err, data) => {
            err ? reject(err) : resolve(data);
        });
    });
}

async function runProgram() {
    const config = await resolveConfigs();
    const fileContents = await getInput(config);
    const activities = await chatdown(fileContents);
    const writeOutConfirmation = writeOut(activities, config);
}

async function writeOut(activities) {

}

function exitWithError(error) {
    process.stdout.write(chalk.red(error));
    process.exit(1);
}

runProgram()
    .then(writeOut).catch(exitWithError);