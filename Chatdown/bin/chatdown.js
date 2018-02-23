const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const help = require('../lib/help');
const chatdown = require('../lib/index');

async function resolveConfigs() {
    const chatdownArgs = require('minimist')(process.argv.slice(2));
    if ('help' in chatdownArgs) {
        help();
        process.exit(0);
    }
    let config;
    try {
        config = JSON.parse(fs.readFileSync(path.resolve((chatdownArgs.config || '.chatrc'))));
    }
    catch (e) {
        // We've been given a config location but its not there
        if (chatdownArgs.config !== undefined) {
            throw new ReferenceError(`${chatdownArgs.config} cannot be found`);
        }
        config = {};
    }
    const mergedConfig = Object.assign(config, chatdownArgs);
    if (!('bot' in mergedConfig) || !('user' in mergedConfig)) {
        let message = !('bot' in mergedConfig) ? chalk`{red --bot is required to be passed in as an argument or as part of the config}\n` : '';
        message += !('user' in mergedConfig) ? chalk`{red --user is required to be passed in as an argument or as part of the config}` : '';
        throw new ReferenceError(message);
    }
    return mergedConfig;
}

function getInput(config) {
    if (!config.in) {
        return new Promise((resolve, reject) => {
            const {stdin} = process;
            let timeout = setTimeout(reject, 1000);
            let input = '';
            stdin.setEncoding('utf8');
            stdin.on('data', chunk => {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                input += chunk;
            });
            stdin.on('end', () => {
                resolve(input)
            });
            stdin.on('error', error => reject(error));
        });
    }
    return fs.readFile(path.resolve(config.in), 'utf-8');
}

async function writeOut(activities, config) {
    const {out} = config;
    if (!out) {
        process.stdout.write(JSON.stringify(activities));
        return true;
    }
    const fileToWrite = path.resolve(out);
    await fs.ensureFile(fileToWrite);
    await fs.writeJson(fileToWrite, activities, {spaces: 2});
    return fileToWrite;
}

async function runProgram() {
    const config = await resolveConfigs();
    const fileContents = await getInput(config);
    const activities = await chatdown(fileContents, config);
    const writeConfirmation = await writeOut(activities, config);
    if (typeof writeConfirmation === 'string') {
        process.stdout.write(chalk`{green Successfully wrote file:} {blue ${writeConfirmation}}\n`);
    }
}

function exitWithError(error) {
    if (error instanceof Error) {
        process.stdout.write(chalk.red(error));
    } else {
        help();
    }
    process.exit(1);
}

runProgram()
    .then(() => process.exit(0))
    .catch(exitWithError);