// Copyright (c) Microsoft Corporation. All rights reserved.

const lgEvaluate = require('./src/lgEvaluate.js');
const lgValidate = require('./src/lgValidate.js');
const processCard = require('./src/processCard.js');

const languageGeneration = function (templates, codeBehind, feedback, entities, entitiesCallback, activity) {
    try {
        lgValidate.validateTemplateDefinitions(templates);
    }
    catch (reason) {
        return Promise.reject(reason);
    }
    return lgEvaluate.languageGeneration(templates, codeBehind, feedback, entities, entitiesCallback, activity);
};

const resolveEntities = function (text, entities, entitiesCallback) {
    return lgEvaluate.resolveEntities(text, entities, entitiesCallback);
};

module.exports = {
    languageGeneration: languageGeneration,
    resolveEntities: resolveEntities,
    // todo: make own module / part of agent parser
    processCard : processCard.processCard
};
