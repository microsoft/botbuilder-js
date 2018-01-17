// Copyright (c) Microsoft Corporation. All rights reserved.

const innerReadCodeRecognizer = function (type, parent)  {
    const childNodes = parent.childNodes;
    for (let i=0; i<childNodes.length; i++) {
        if (childNodes.item(i).tagName !== type) {
            continue;
        }
        const element = childNodes.item(i);
        const name = element.getAttribute('name');
        const onRun = element.getAttribute('onRun');
        if (onRun === undefined) {
            throw `${name} expected 'onRun' attribute with a value that represents a JavaScript function name`;
        }
        return { type: type, onRun: onRun, name : name };
    }
};

const readCodeRecognizer = function (parent) {
    return innerReadCodeRecognizer('CodeRecognizer', parent);
};

const readConversationUpdateRecognizer = function (parent) {
    return innerReadCodeRecognizer('ConversationUpdateRecognizer', parent);
};

const readLuisRecognizer = function (parent) {
    const childNodes = parent.childNodes;
    for (let i=0; i<childNodes.length; i++) {
        if (childNodes.item(i).tagName !== 'LUISRecognizer') {
            continue;
        }
        const element = childNodes.item(i);
        const name = element.getAttribute('name');
        const intentID = element.getAttribute('intentID');
        if (intentID === undefined) {
            throw new Error(`${name} expected 'intentID' attribute`);
        }
        const intentName = element.getAttribute('intentName');
        if (intentName === undefined) {
            throw new Error(`${name} expected 'intentName' attribute`);
        }
        const appID = element.getAttribute('appID');
        if (appID === undefined) {
            throw new Error('expected appID attribute');
        }
        const onRecognize = element.getAttribute('onRecognize');
        const key = element.getAttribute('key');

        return { type: 'LUISRecognizer', intentID: intentID, intentName: intentName, appID: appID, name: name, key: key, onRecognize : onRecognize };
    }
};

const readRegexRecognizer = function (parent)  {
    const childNodes = parent.childNodes;
    for (let i=0; i<childNodes.length; i++) {
        if (childNodes.item(i).tagName !== 'RegexRecognizer') {
            continue;
        }
        const element = childNodes.item(i);
        const name = element.getAttribute('name');
        const pattern = element.getAttribute('pattern');
        if (pattern === undefined) {
            throw `${name} expected 'pattern' attribute with a value that represents a valid JavaScript regular expression pattern`;
        }
        return { type: 'RegexRecognizer', pattern: pattern, name : name };
    }
};

const readRecognizer = function (task) {
    const codeRecognizer = readCodeRecognizer(task);
    if (codeRecognizer !== undefined) {
        return codeRecognizer;
    }
    const luisRecognizer = readLuisRecognizer(task);
    if (luisRecognizer !== undefined) {
        return luisRecognizer;
    }
    const conversationUpdateRecognizer = readConversationUpdateRecognizer(task);
    if (conversationUpdateRecognizer !== undefined) {
        return conversationUpdateRecognizer;
    }
    const regexRecognizer = readRegexRecognizer(task);
    if (regexRecognizer !== undefined) {
        return regexRecognizer;
    }
    return undefined;
};

module.exports = {
    innerReadCodeRecognizer: innerReadCodeRecognizer,
    readConversationUpdateRecognizer: readConversationUpdateRecognizer,
    readLuisRecognizer: readLuisRecognizer,
    readCodeRecognizer: readCodeRecognizer,
    readRegexRecognizer: readRegexRecognizer,
    readRecognizer: readRecognizer
};
