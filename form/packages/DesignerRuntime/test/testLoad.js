// Copyright (c) Microsoft Corporation. All rights reserved.

const fs = require('fs');
const path = require('path');
const DOMParser = require('xmldom').DOMParser;
const agentDefinition = require('../../AgentDefinition/index.js');

const scenarioBaseAddress = '../../../scenarios/';

const agentScenario = function (scenarioName) {
    const fullName = path.resolve(__dirname, scenarioBaseAddress, scenarioName, scenarioName + '.agent');
    return fs.readFileSync(fullName, 'utf8');
};

const loadScenarioJs = function (scenarioName) {
    const jsfileName = path.resolve(__dirname, scenarioBaseAddress, scenarioName, 'bot.v2.js');
    if (fs.existsSync(jsfileName)) {
        return require(jsfileName);
    }
    return {};
};

const loadCards = function (scenarioName) {
    const cardDir = path.resolve(__dirname, scenarioBaseAddress, scenarioName, 'cards');
    if (!fs.existsSync(cardDir)) {
        return {};
    }
    const items = fs.readdirSync(cardDir);
    const cards = {};
    try {
        for (let name of items) {
            const cardPath = path.resolve(__dirname, scenarioBaseAddress, scenarioName, 'cards', name);
            let content = fs.readFileSync(cardPath, 'utf8');
            content = content.substring(1);
            cards[name] = JSON.parse(content);
        }
    }
    catch (err) {
        throw new Error('cannot read cards', err);
    }
    return cards;
};

const loadScenarioResult = function (scenarioName, index) {
    // If JSLOG file exists load it otherwise use the C# log file
    // For the cases where a change in log is accepted
    const jsResultFileName = path.resolve(__dirname, scenarioBaseAddress, scenarioName, `${scenarioName}-${index}.JSLOG.json`);
    if (fs.existsSync(jsResultFileName)) {
        return JSON.parse(fs.readFileSync(jsResultFileName, 'utf8'));
    }

    const resultFileName = path.resolve(__dirname, scenarioBaseAddress, scenarioName, `${scenarioName}-${index}.json`);
    if (fs.existsSync(resultFileName)) {
        return JSON.parse(fs.readFileSync(resultFileName, 'utf8'));
    }
    return {};
};

const loadScenarioActivity = function (scenarioName, file) {
    const jsResultFileName = path.resolve(__dirname, scenarioBaseAddress, scenarioName, file);
    if (fs.existsSync(jsResultFileName)) {
        return JSON.parse(fs.readFileSync(jsResultFileName, 'utf8'));
    }
    return {};
};

const writeOutput = function (scenarioName, name, value) {
    const resultFileName = path.resolve(__dirname, scenarioBaseAddress, scenarioName, name);
    fs.writeFileSync(resultFileName, value, 'utf8');
};

module.exports = {
    agentScenario: agentScenario,
    loadScenarioResult: loadScenarioResult,
    loadScenarioJs: loadScenarioJs,
    loadCards: loadCards,
    writeOutput: writeOutput,
    loadScenarioActivity: loadScenarioActivity
};
