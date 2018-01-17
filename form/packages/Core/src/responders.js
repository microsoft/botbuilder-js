// Copyright (c) Microsoft Corporation. All rights reserved.

const lg = require('bot-framework-lg');
const typedAccessor = require('./typedAccessor.js');

const accessor = function (name, context) {
    // this deals with string or array of string
    if (!(name in context.local)) {
        return '';
    }
    if (typeof context.local[name] === 'string') {
        return context.local[name];
    }
    if (Array.isArray(context.local[name])) {
        return context.local[name][0];
    }
    // TODO when we introduce types we can move the toNaturalLanguage function onto each type
    // but for now we will just keep all the type specific language generation in one place.
    return typedAccessor.toNaturalLanguage(context.local[name]);
};

const executeRespond = function (templates, cards, feedback, beforeResponse, context, codeBehind) {
    return lg.languageGeneration(templates, codeBehind, feedback, context, accessor, context.request).then((rsp) => {
        return processCards(feedback, cards, rsp, context).then(() => {
            context.responses.push(rsp);
            return executeBefore(beforeResponse, context, codeBehind);
        });
    });
};

const executeBefore = function (beforeResponse, context, codeBehind) {
    if (!beforeResponse) {
        return Promise.resolve();
    }

    const fn = codeBehind[beforeResponse];
    if (typeof fn === 'function') {
        return Promise.resolve(fn(context));
    }
    throw new Error(`cannot find function with name ${beforeResponse}`);
};

const processCards = function (feedback, cards, rsp, context) {
    var cardName;
    // select adaptive card
    switch (feedback.type) {
        case 'Feedback':
        case 'FeedbackPerModality':
            cardName = feedback.adaptiveCard;
            break;
        case 'FeedbackOneOf':
            if (feedback.values && feedback.values.length > 0) {
                cardName = feedback.values[0].adaptiveCard;
            }
            break;
    }

    if (cardName && cardName.length > 0) {
        var card = cards[cardName];
        return lg.processCard(card, context, accessor, (x) => {
            return Promise.resolve(lg.resolveEntities(x, context, accessor));
        }).then(() => {
            if (card !== undefined) {
                rsp.attachments = rsp.attachments || [];
                rsp.attachments.push(card);
            }
            return Promise.resolve();
        });
    }
    return Promise.resolve();
};

module.exports = {
    executeRespond: executeRespond
};