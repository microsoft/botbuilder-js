// Copyright (c) Microsoft Corporation. All rights reserved.

const DispatcherFactory = require('./src/dispatcherFactory.js').DispatcherFactory;
const evaluate = require('./src/doAction.js').evaluate;

module.exports = {
    evaluate: evaluate,
    DispatcherFactory: DispatcherFactory
};
