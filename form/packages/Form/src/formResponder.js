// Copyright (c) Microsoft Corporation. All rights reserved.

const core = require('bot-framework-core');
const formBuiltinTemplates = require('./formBuiltinTemplates.js');

const responder = function (metadata, context, formMetadata, templates, cards, codeBehind) {
    const builtinTemplates = formBuiltinTemplates.createTemplates(formMetadata.fields, context);
    Object.assign(templates, builtinTemplates);
    const beforeResponse = undefined;
    return core.responder(templates, cards, metadata.feedback, beforeResponse, context, codeBehind);
};

module.exports.responder = responder;
