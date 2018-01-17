// Copyright (c) Microsoft Corporation. All rights reserved.

const formResponder = require('./formResponder.js');

const hasRequiredOptionalPrompt = function (formMetadata) {
    return formMetadata.prompts.find(prompt => prompt.when === 'builtin.anyRequiredOptionalMissing');
};

const hasRequiredPrompt = function (formMetadata) {
    return formMetadata.prompts.find(prompt => prompt.when === 'builtin.anyRequiredMissing');
};

const hasOptionalPrompt = function (formMetadata) {
    return formMetadata.prompts.find(prompt => prompt.when === 'builtin.anyOptionalMissing');
};

const hasSingleRequiredPrompt = function (formMetadata, required) {
    return formMetadata.prompts.find(prompt => prompt.when.includes(required));
};

const hasAllRequiredFilledPrompt = function (formMetadata) {
    return formMetadata.prompts.find(prompt => prompt.when === 'builtin.allRequiredFilled');
};

const pickFirstUnfilledFieldPrompt = function (formMetadata, locals) {
    for (const prompt of formMetadata.prompts.filter(p => p.when.indexOf('builtin.') !== 0)) {
        if (!(prompt.when in locals)) {
            return prompt;
        }
    }
    return undefined;
};

const prompt = function (formMetadata, context, templates, cards, codeBehind) {

    const required = formMetadata.fields.filter((f) => { return !(f.entity in context.local) && f.required; });
    const optional = formMetadata.fields.filter((f) => { return !(f.entity in context.local) && !f.required; });

    if (required.length === 0) {
        const prompt = hasAllRequiredFilledPrompt(formMetadata);
        if (prompt) {
            return formResponder.responder(prompt, context, formMetadata, templates, cards, codeBehind);
        }
    }
    if (required.length === 1) {
        const prompt = hasSingleRequiredPrompt(formMetadata, required[0].entity);
        if (prompt) {
            return formResponder.responder(prompt, context, formMetadata, templates, cards, codeBehind).then(() => {
                return required[0].entity;
            });
        }
    }
    if (required.length > 0 && optional.length > 0) {
        const prompt = hasRequiredOptionalPrompt(formMetadata);
        if (prompt) {
            return formResponder.responder(prompt, context, formMetadata, templates, cards, codeBehind);
        }
    }
    if (required.length > 0) {
        const prompt = hasRequiredPrompt(formMetadata);
        if (prompt) {
            return formResponder.responder(prompt, context, formMetadata, templates, cards, codeBehind);
        }
    }
    if (optional.length > 0) {
        const prompt = hasOptionalPrompt(formMetadata);
        if (prompt) {
            return formResponder.responder(prompt, context, formMetadata, templates, cards, codeBehind);
        }
    }

    if (required.length > 0) {
        const prompt = pickFirstUnfilledFieldPrompt(formMetadata, context.local);
        if (prompt) {
            return formResponder.responder(prompt, context, formMetadata, templates, cards, codeBehind).then(() => {
                return prompt.when;
            });
        }
    }

    return Promise.reject(new Error('no corresponding Prompt has been defined'));
};

module.exports.prompt = prompt;