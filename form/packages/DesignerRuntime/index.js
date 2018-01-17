// Copyright (c) Microsoft Corporation. All rights reserved.

const agent = require('./src/agent.js');
const runtime = require('./src/runtime.js');
const dispatcher = require('./src/dispatcher.js');

module.exports = {
    createFromAgent: agent.createDispatchTable,
    evaluate: runtime.evaluate,
    dispatch : dispatcher.send
};
