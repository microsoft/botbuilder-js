// Copyright (c) Microsoft Corporation. All rights reserved.

const lgTokenize = require('./lgTokenize.js');

const defaultEntitiesCallback = (name, entities) => {
    const entityValue = entities[name];
    if (typeof entityValue === 'object') {
        return entityValue.value;
    }
    return entityValue !== undefined ? entityValue : '';
};

const resolveEntities = function (text, entities, entitiesCallback = defaultEntitiesCallback) {
    return substitueEntities(text, entitiesCallback, entities);
};

const languageGeneration = function (templates, codeBehind, feedback, entities, entitiesCallback = defaultEntitiesCallback, activity) {
    // this is a weak attempt to use the same random number pick for Speak as was used in text
    // we could also make a random number sticky per template if that was useful
    const randomNumbers = [];
    let randomNumberIndex = 0;
    const nextRandom = (max) => {
        const next = Math.floor(Math.random() * max);
        randomNumbers.push(next);
        return next;
    };
    const replayRandom = (max) => {
        if (randomNumberIndex < randomNumbers.length) {
            const randomNumber = randomNumbers[randomNumberIndex++];
            if (randomNumber < max) {
                return randomNumber;
            }
        }
        return Math.floor(Math.random() * max);
    };
    return new Promise(function (resolve, reject) {
        const result = {};
        evaluatePerModality(templates, codeBehind, feedback, entities, 'Text', nextRandom, activity)
            .then((text) => {
                result.text = substitueEntities(text, entitiesCallback, entities);
                evaluatePerModality(templates, codeBehind, feedback, entities, 'Speak', replayRandom, activity)
                    .then((speak) => {
                        result.speak = substitueEntities(speak, entitiesCallback, entities);
                        resolve(result);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error);
            });
    });
};

const evaluatePerModality = function (templates, codeBehind, feedback, entities, modality, random, activity) {
    const result = lgTokenize.tokenizeTemplates(evaluateFeedback(feedback, modality, random));
    return evaluate(templates, codeBehind, entities, modality, result, random, activity)
        .then(function () { return result.join(''); });
};

const evaluate = function (templates, codeBehind, entities, modality, result, random, activity) {
    const i = result.findIndex(function (s) { return s.charAt(0) === '['; });
    if (i >= 0) {
        return lookupAndEvaluateTemplate(i, templates, codeBehind, entities, modality, result, random, activity)
            .then(function () { return evaluate(templates, codeBehind, entities, modality, result, random, activity); });
    }
    return Promise.resolve();
};

const lookupAndEvaluateTemplate = function (i, templates, codeBehind, entities, modality, result, random, activity) {
    const name = result[i].substr(1).slice(0, -1);
    if (name in templates) {
        return evaluateTemplate(templates[name], codeBehind, entities, modality, random, activity)
            .then(function (templateValue) {
                const next = lgTokenize.tokenizeTemplates(templateValue);
                const argsArray = [i, 1].concat(next);
                Array.prototype.splice.apply(result, argsArray);
            });
    }
    else {
        return Promise.reject(`Template "${name}" is not defined.`);
    }
};

const evaluateTemplate = function (template, codeBehind, entities, modality, random, activity) {
    try {
        switch (template.type) {
            case 'SimpleResponseTemplate': {
                return Promise.resolve(evaluateFeedback(template.feedback, modality, random, activity));
            }
            case 'ConditionalResponseTemplate': {
                const kyz = Object.keys(template.cases);
                if (kyz.length === 0) {
                    throw new Error('There are no Cases defined for the Conditional Template');
                }
                if (template.onRun === undefined) {
                    return Promise.resolve(evaluateFeedback(template.cases[kyz[0]], modality, random, activity));
                }
                const onRun = (codeBehind !== undefined) ? codeBehind[template.onRun] : undefined;
                if (onRun === undefined) {
                    const caseValue = template.cases[Object.keys(template.cases)[0]];
                    if (caseValue === undefined) {
                        throw new Error('There are no cases defined for the Conditional Template');
                    }
                    return Promise.resolve(evaluateFeedback(caseValue, modality, random, activity));
                }
                // "template" is standing in for "this"
                entities.currentTemplate = { name: template.name, modalityDisplay: (modality === 'Text'), modalitySpeak: (modality === 'Speak') };
                return Promise.resolve(onRun.call(template, entities))
                    .then(function (caseValue) {
                        delete entities.currentTemplate;
                        if (caseValue === undefined) {
                            throw new Error(`The function "${template.onRun}" returned undefined`);
                        }
                        const caseFeedback = template.cases[caseValue];
                        if (caseFeedback === undefined) {
                            throw new Error(`The function "${template.onRun}" returned "${caseValue}" which does not match any of the cases`);
                        }
                        return evaluateFeedback(caseFeedback, modality, random, activity);
                    });
            }
        }
        return Promise.resolve('');
    }
    catch (error) {
        return Promise.reject(error);
    }
};

const evaluateFeedback = function (feedback, modality, random, activity) {
    if (feedback !== undefined) {
        switch (feedback.type) {
            case 'Feedback': {
                return feedback.value;
            }
            case 'FeedbackPerModality': {
                switch (modality) {
                    case 'Text': return feedback.text;
                    case 'Speak': return feedback.speak;
                    default:
                        throw new Error(`Modality not understood ${modality}`);
                }
            }
            case 'FeedbackOneOf': {
                const index = random.call(null, feedback.values.length);
                return evaluateFeedback(feedback.values[index], modality, random, activity);
            }
        }
    }
    return '';
};

const substitueEntities = function (s, entitiesCallback, entities) {
    const result = [];
    const missingEntityNames = [];
    for (const token of lgTokenize.tokenizeEntities(s)) {
        if (token.charAt(0) === '{') {
            const name = token.substr(1).slice(0, -1);
            const value = entitiesCallback(name, entities);
            if (value === undefined) {
                missingEntityNames.push(name);
            }
            else {
                result.push(value);
            }
        }
        else {
            result.push(token);
        }
    }

    if (missingEntityNames.length > 0) {
        const names = missingEntityNames.map((name) => { return '"' + name + '"'; }).join(',');
        throw new Error(`The referenced Entities ${names} could not be found.`);
    }

    return result.join('');
};

module.exports = {
    languageGeneration: languageGeneration,
    resolveEntities: resolveEntities
};
