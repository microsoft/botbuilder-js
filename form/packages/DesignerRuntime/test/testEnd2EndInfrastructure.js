
const testLoad = require('./testLoad.js');

const ifdo = require('../../DoAction/index.js');
const designerRuntime = require('../../DesignerRuntime/index.js');
const core = require('../../Core/index.js');

const deepEqual = require('deep-equal');
const deepCopy = require('deepcopy');
const fs = require('fs');

const runTest = function () {
    const context = {
        local: {},
        global: {},
        request: {},
        responses: []
    };
    const config = {
        messageId: 0
    };
    return testContext(config, context, ...arguments);
};

const testContext = function () {
    let args = Array.from(arguments);
    const config = args[0];
    const context = args[1];
    const name = args[2];
    const ordinal = args[3];

    const inputs = args.splice(4);
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].startsWith('file:///')) {
            inputs[i] = testLoad.loadScenarioActivity(name, inputs[i].substr(8));
        }
    }
    const agent = testLoad.agentScenario(name);
    const codeBehind = testLoad.loadScenarioJs(name);
    const cards = testLoad.loadCards(name);

    let expectedLog = testLoad.loadScenarioResult(name, ordinal);
    let createdLog = [];

    const data = {
        agent: agent,
        cards: cards,
        codeBehind: codeBehind
    };
    return evaluateWithInput(data, inputs, context, createdLog, config).then(() => {
        createdLog = JSON.parse(JSON.stringify(createdLog));
        expectedLog = JSON.parse(JSON.stringify(expectedLog));

        // compare logs
        if (createdLog.length !== expectedLog.length) {
            reportError(name, ordinal, createdLog, expectedLog);
        }

        if (!deepEqual(createdLog, expectedLog)) {
            reportError(name, ordinal, createdLog, expectedLog);
        }
        return Promise.resolve();
    });
};

const mockHttp = function (options) {
    let response = {
        statusCode: '200',
        body: '{"a":"b"}'
    };

    return Promise.resolve(response);
};

// http is a global function provided by the environment in Chakra
http = { request: mockHttp }; //eslint-disable-line no-undef

const reportError = function (name, ordinal, createdLog, expectedLog) {
    testLoad.writeOutput(name, `{mismatched}-${ordinal}.json`, JSON.stringify(createdLog, null, 2));
    throw new Error('mismatched logs.');
};

const evaluateWithInput = function (data, inputs, state, createdLog, config) {
    let input = inputs.shift();
    if (input === undefined) {
        return Promise.resolve();
    }

    let activity;
    if (typeof input === 'object') {
        activity = input;
    } else {
        activity = getMessageActivity(input, config);
    }
    createdLog.push(deepCopy(activity));
    const options = {};
    return designerRuntime.dispatch(activity, data.agent, data.codeBehind, state, data.cards, options).then((result) => {
        for (var rsp of result.context.responses) {
            let rspActivity = getResponseActivity(rsp.text, rsp.speak, config, rsp.inputHint, rsp.attachments, rsp.type);
            createdLog.push(deepCopy(rspActivity));
        }
        createdLog.push(getState(deepCopy(result.state)));
        return evaluateWithInput(data, inputs, result.state, createdLog, config);
    }).catch((err) => {
        createdLog.push({ error: err.message });
        return evaluateWithInput(data, inputs, state, createdLog, config);
    });
};

const getState = function (state) {
    return {
        'sticky': state.sticky,
        'flow': state.flow || {
            'stack': []
        },
        'data': {
            'taskEntities': state.data.taskEntities,
            'global': state.data.global,
        }
    };
};

const addTypes = function (entities) {
    for (var key in entities) {
        for (var item of entities[key]) {
            item.type = key;
        }
    }
};

const getMessageActivity = function (text, config) {
    config.messageId = config.messageId + 1;
    return {
        text: text
    };
};

const getResponseActivity = function (text, speak, config, inputHint, attachments, type) {
    return {
        'text': text,
        'speak': speak,
        'inputHint': inputHint || 'acceptingInput',
        'type': type,
        'attachments': attachments || undefined,
    };
};

module.exports.runTest = runTest;
