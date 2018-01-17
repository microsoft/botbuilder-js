// Copyright (c) Microsoft Corporation. All rights reserved.

// this code is only necessary as a work around for the current state of the datetime recognizer
// in the current package (rc28) the result has embedded Map types and in one scenario an embedded Date
// refer https://github.com/Microsoft/Recognizers-Text/issues/185 for more details

module.exports.convertToRaw = function convertToRaw (obj) {
    const convertMap = function (m) {
        const obj = {};
        m.forEach((v, k) => { 
            obj[k.toString()] = convertToRaw(v);
        });
        return obj;
    };
    const convertSet = function (s) {
        const array = [];
        s.forEach((v) => {
            array.push(convertToRaw(v));
        });
        return array;
    };
    if (obj instanceof Date) {
        // this only seem to happen when we have a daterange
        return obj.toISOString().split('T')[0];
    }
    if (obj instanceof Map || obj instanceof WeakMap) {
        return convertMap(obj);
    }
    if (obj instanceof Set || obj instanceof WeakSet) {
        return convertSet(obj);
    }
    if (Array.isArray(obj)) {
        const result = [];
        obj.forEach(v => { result.push(convertToRaw(v)); });
        return result;
    }
    if (typeof obj === 'object') {
        if (obj === null) {
            return obj;
        }
        const result = {};
        for (const p in obj) {
            result[p] = convertToRaw(obj[p]);
        }
        return result;
    }
    return obj;
};
