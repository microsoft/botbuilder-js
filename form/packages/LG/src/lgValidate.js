// Copyright (c) Microsoft Corporation. All rights reserved.

const lgTokenize = require('./lgTokenize.js');

const validateTemplateDefinitions = function (templates) {
    for (const templateName in templates) {
        dependencyTemplate(templates[templateName], templates);
    }
    // JSON.stringify detects loops in JavaScript object structures
    try {
        JSON.stringify(templates);
    }
    catch (exception) {
        if (exception.name === 'TypeError' && exception.message === 'Converting circular structure to JSON') {
            throw new Error('Template definitions should not contain loops');
        }
        throw exception;
    }
};

const tokenizeValue = function (value) {
    const tokens = [];
    const set = new Set();
    for (const token of lgTokenize.tokenizeTemplates(value)) {
        if (token.length > 0 && token.charAt(0) === '[') {
            const templateName = token.substr(1).slice(0, -1);
            if (!set.has(templateName)) {
                tokens.push({ referencedTemplateName: templateName });
                set.add(templateName);
            }
        }
    }
    return tokens;
};

const dependencyTemplate = function (template, templates) {
    if (template.type !== undefined) {
        template.children = [];
        switch (template.type) {
            case 'SimpleResponseTemplate':
                dependencySimpleResponseTemplate(template, templates);
                return;
            case 'ConditionalResponseTemplate':
                dependencyConditionalResponseTemplate(template, templates);
                return;
        }
    }
    throw new Error('Template must be SimpleResponseTemplate or ConditionalResponseTemplate');
};

const dependencySimpleResponseTemplate = function (template, templates) {
    dependencyFeedback(template.feedback, templates, template);
};

const dependencyConditionalResponseTemplate = function (template, templates) {
    if (template.cases === undefined) {
        throw new Error('ConditionalResponseTemplate requires Cases');
    }
    for (const option in template.cases) {
        dependencyFeedback(template.cases[option], templates, template);
    }
};

const dependencyFeedback = function (feedback, templates, parent) {
    if (feedback === undefined || feedback.type === undefined) {
        return;
    }
    switch (feedback.type) {
        case 'Feedback':
            if (feedback.value === undefined) {
                throw new Error('Feedback requires a "value" property.');
            }
            dependencyValue(tokenizeValue(feedback.value), templates, parent);
            return;
        case 'FeedbackPerModality':
            if (feedback.text === undefined) {
                throw new Error('FeedbackPerModality requires a "text" property.');
            }
            if (feedback.speak === undefined) {
                throw new Error('FeedbackPerModality requires a "speak" property.');
            }
            dependencyValue(tokenizeValue(feedback.display), templates, parent);
            dependencyValue(tokenizeValue(feedback.speak), templates, parent);
            return;
        case 'FeedbackOneOf': {
            for (const value of feedback.values) {
                dependencyFeedback(value, templates, parent);
            }
            return;
        }
    }
    throw new Error('Feedback should be Feedback, FeedbackOneOf or FeedbackModaility');
};

const dependencyValue = function (tokens, templates, parent) {
    for (const token of tokens) {
        const name = token.referencedTemplateName;
        const referencedTemplate = templates[name];
        if (referencedTemplate === undefined) {
            throw new Error(`Template "${name}" is not defined.`);
        }
        parent.children.push(referencedTemplate);
    }
};

module.exports = {
    validateTemplateDefinitions: validateTemplateDefinitions
};
