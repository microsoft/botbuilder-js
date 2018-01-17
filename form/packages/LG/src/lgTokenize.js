// Copyright (c) Microsoft Corporation. All rights reserved.

const tokenize = function (s, open, close) {

    const commit = function (ch) {
        if (state === 'template') {
            if (ch !== close) {
                throw 'syntax error';
            }
            current = open + current + close;
        }
        result.push(current);
        current = '';
    };

    const result = [];
    let current = '';
    let state = 'text';
    if (s === undefined) {
        commit('');
        return result;
    }

    for (const ch of s) {
        switch (ch) {
            case open:
                commit(ch);
                state = 'template';
                break;
            case close:
                commit(ch);
                state = 'text';
                break;
            default:
                current += ch;
                break;
        }
    }
    commit(''); 
    return result;
};

const tokenizeTemplates = function (s) {
    return tokenize(s, '[', ']');
};

const tokenizeEntities = function (s) {
    return tokenize(s, '{', '}');
};

module.exports = {
    tokenizeEntities: tokenizeEntities,
    tokenizeTemplates: tokenizeTemplates
};
