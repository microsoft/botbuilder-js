// Copyright (c) Microsoft Corporation. All rights reserved.
const promisedRetry = require('./retry').promisedRetry;

const addEntitiesToContext = function (context, body) {
    const types = {};
    const transformed = {};
    const strCurrent = '@current';

    body.entities.forEach(function (entity) {
        transformed[entity.type] = transformed[entity.type] || [];
        transformed[entity.type].push(entity);
    });

    for (let type in transformed) {
        if (transformed[type].length === 1) {
            addToLocal(context, type, transformed[type][0].entity);
        }
        else {
            transformed[type].forEach(function (item) {
                addToLocal(context, type, item.entity);
            });
        }
        context.local[strCurrent] = {};
        context.local[strCurrent][type] = context.local[strCurrent][type] || [];
        context.local[strCurrent][type].push(transformed[type]);
    }
    if (body.compositeEntities) {
        context.local.compositeEntities = body.compositeEntities;
    }
};

const addToLocal = function (context, type, value) {
    if (typeof value === undefined) {
        return;
    }
    let currentValue = context.local[type];
    switch (typeof currentValue) {
        case 'undefined':
            context.local[type] = value;
            break;
        case 'string':
            currentValue = [].concat(currentValue);
        case 'object': //eslint-disable-line no-fallthrough
            if (typeof value === 'string') {
                currentValue.push(value);
            } else if (Array.isArray(value)) {
                currentValue = currentValue.concat(value);
            } else {
                throw new Error(`cannot add ${typeof value} in local.`);
            }
            context.local[type] = currentValue;
            break;
    }
};

const luisRecognizer = function (metadata, options, context, codebehind) {
    return match(metadata, options, context).then((rsp) => {
        if (!rsp) {
            return Promise.resolve(false);
        }
        if (!metadata.onRecognize) {
            return Promise.resolve(rsp);
        }
        return executeCodeRecognizer(metadata.onRecognize, codebehind, context);
    });
};

const match = function (metadata, options, context) {
    const intentID = metadata.intentID;
    const expectedIntent = metadata.intentName;
    const appID = metadata.appID;
    if (!context.request.text) {
        return Promise.resolve(false);
    }
    if (context.luisCache) {
        for (let item of context.luisCache) {
            if (item.text === context.request.text && item.appID === appID && item.key === options.luisKey) {
                if (item.intent === expectedIntent) {
                    addEntitiesToContext(context, item.body);
                    return Promise.resolve(true);
                }
                else {
                    return Promise.resolve(false);
                }
            }
        }
    }

    if (options.luisRedirect === undefined) {
        // No luis redirect defined. Make an http call.
        return promisedRetry(() => { return matchHttpResponse(context.request.text, intentID, expectedIntent, appID, options.luisKey, options.luisUrl, context); }, 300, 3);
    }
    else {
        // Use luis redirect
        return options.luisRedirect(expectedIntent, appID, context, options).then(function (body) {  //eslint-disable-line no-undef
            console.info(`Luis Response : ${JSON.stringify(body, null, 2)}`);
            if (!body.topScoringIntent) {
                return Promise.resolve(false);
            }

            const intent = body.topScoringIntent.intent;
            context.luisCache = [];
            context.luisCache.push({
                text: context.request.text,
                intent: intent,
                appID: appID,
                key: options.luisKey,
                body: body
            });

            if (intent === expectedIntent) {
                addEntitiesToContext(context, body);
                return Promise.resolve(true);
            }
            else {
                return Promise.resolve(false);
            }
        });
    }
};

const matchHttpResponse = function (text, intentID, expectedIntent, appID, key, baseUrl, context) {
    baseUrl = baseUrl || 'https://westus.api.cognitive.microsoft.com/luis/v2.0';
    let uri = `${baseUrl}/apps/${appID}?subscription-key=${key}&timezoneOffset=0&q=${text}`;
    const https = require('https');
    return new Promise((resolve, reject) => {
        https.get(uri, (res) => {
            const { statusCode } = res;

            if (statusCode !== 200 & statusCode !== 202) {
                return reject({ reason: `LUIS returned statusCode: ${statusCode}` });
            }

            let rawData = '';
            res.on('data', (chunk) => rawData += chunk);
            res.on('end', () => {
                try {
                    const body = JSON.parse(rawData);
                    if (!body.topScoringIntent) {
                        resolve(false);
                        return;
                    }
                    const intent = body.topScoringIntent.intent;
                    context.luisCache = [];
                    context.luisCache.push({
                        text: text,
                        intent: intent,
                        appID: appID,
                        key: key,
                        body: body
                    });
                    if (intent === expectedIntent) {
                        addEntitiesToContext(context, body);
                        return resolve(true);
                    }
                    else {
                        return resolve(false);
                    }
                } catch (e) {
                    return reject({ reason: 'could not parse json response', err: e });
                }
            });
            res.on('error', (e) => Promise.reject({ reason: 'could not make luis call', err: e }));
        });
    });
};

const executeCodeRecognizer = function (name, codeBehind, context) {
    const fn = codeBehind[name];
    if (typeof fn !== 'function') {
        throw new Error(`Function not found. ${name}`);
    }
    try {
        return Promise.resolve(fn(context));
    }
    catch (err) {
        return Promise.reject(`user code in ${name} threw exception: ${err ? err : 'undefined'}`);
    }
};

const regexRecognizer = function (metadata, context) {
    // Note: Once JS has named capture groups (post ES6) we could use named capture groups to capture entities.
    if (!context.request.text) {
        return Promise.resolve(false);
    }
    try {
        const regex = new RegExp(metadata.pattern, 'i');
        const match = regex.test(context.request.text);
        return Promise.resolve(match);
    }
    catch (err) {
        return Promise.reject(`regular expression '${metadata.pattern}' threw exception: ${err ? err : 'undefined'}`);
    }
};

const processCardAction = function (context) {
    // if there is no text and activity contains value then it comes from an adaptive card.
    // bind the adaptive card inputs to task entity
    if (!context.request.text && context.request.value && typeof context.request.value == 'object') {
        for (let key in context.request.value) {
            if (key === '@task') {
                context.sticky = context.request.value[key];
            }
            const val = context.request.value[key];
            if (Array.isArray(val)) {
                for (let k in val) {
                    context.local[key].push(val[k]);
                }
            }
            context.local[key] = val;
        }
        return true;
    }
    return false;
};

module.exports = {
    luisRecognizer: luisRecognizer,
    codeRecognizer: executeCodeRecognizer,
    regexRecognizer: regexRecognizer,
    processCardAction: processCardAction,
};