// Copyright (c) Microsoft Corporation. All rights reserved.

const recognizers = require('./src/recognizers.js');
const responders = require('./src/responders.js');
const typedAccessor = require('./src/typedAccessor.js');

module.exports = {
    luisRecognizer: recognizers.luisRecognizer,
    codeRecognizer: recognizers.codeRecognizer,
    regexRecognizer: recognizers.regexRecognizer,
    responder: responders.executeRespond,
    processCardAction: recognizers.processCardAction,
    toNaturalLanguage: typedAccessor.toNaturalLanguage
};