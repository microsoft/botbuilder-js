// Copyright (c) Microsoft Corporation. All rights reserved.

const core = require('bot-framework-core');

const formatList = function (fields) {
    let result = [];
    if (fields.length > 2) {
        for (let i=0; i<fields.length-2; i++) {
            result.push('"');
            result.push(fields[i]);
            result.push('"');
            result.push(', ');
        }
    }
    if (fields.length > 1) {
        result.push('"');
        result.push(fields[fields.length-2]);
        result.push('"');
        result.push(' and ');
    }
    if (fields.length > 0) {
        result.push('"');
        result.push(fields[fields.length-1]);
        result.push('"');
    }
    return result.join('');
};

const createRequiredFieldsMissing = function (fields, locals, templates) {
    const missing = fields
        .filter((f) => { return !(f.entity in locals) && f.required; })
        .map((f) => { return f.displayName || f.entity; });
    const value = formatList(missing);
    const template = {
        type: 'SimpleResponseTemplate',
        name: 'builtin.requiredFieldsMissing',
        feedback: { type: 'Feedback', value: value }
    };
    templates[template.name] = template;
};

const createOptionalFieldsMissing = function (fields, locals, templates) {
    const optional = fields
        .filter((f) => { return !(f.entity in locals) && !f.required; })
        .map((f) => { return f.displayName || f.entity; });
    const value = formatList(optional);
    const template = {
        type: 'SimpleResponseTemplate',
        name: 'builtin.optionalFieldsMissing',
        feedback: { type: 'Feedback', value: value }
    };
    templates[template.name] = template;
};

const getFilled = function (fields, locals) {
    const formFields = {};
    fields.forEach((field) => { return formFields[field.entity] = field; });
    const result = [];
    for (const local in locals) {
        if (local in formFields) {
            const o = locals[local];
            const value = typeof o === 'string' ? o : core.toNaturalLanguage(o);
            result.push(`${formFields[local].displayName || local} = ${value}`);
        }
    }
    return result;
};

const createFilledFields = function (fields, locals, templates) {
    const filled = getFilled(fields, locals);
    const value = formatList(filled);
    const template = {
        type: 'SimpleResponseTemplate',
        name: 'builtin.filledFields',
        feedback: { type: 'Feedback', value: value }
    };
    templates[template.name] = template;
};

const createLastPrompt = function (fields, context, templates) {
    if (context.flow && context.flow.stack && context.flow.stack.length > 0) {
        const entry = context.flow.stack[0];
        if (entry.type === 'SingleEntityPrompt') {
            const entityName = entry.entityName;
            const entity = fields.find(e => e.entity === entityName);
            const displayName = entity.displayName || entity.entity;
            const template = {
                type: 'SimpleResponseTemplate',
                name: 'builtin.lastPrompt',
                feedback: { type: 'Feedback', value: displayName }
            };
            templates[template.name] = template;
        }
    }
};

const createTemplates = function (fields, context) {
    const templates = [];
    createRequiredFieldsMissing(fields, context.local, templates);
    createOptionalFieldsMissing(fields, context.local, templates);
    createFilledFields(fields, context.local, templates);
    createLastPrompt(fields, context, templates);
    return templates;
};

module.exports.createTemplates = createTemplates;
