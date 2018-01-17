// Copyright (c) Microsoft Corporation. All rights reserved.

const { Timex, resolver, creator } = require('bot-framework-datatypes');
const convertToRaw = require('./convertToRaw.js');

const extractDateTime = function (result, constraints) {
    // temporary work around for Map and Date objects in datetime recognizer results
    result = convertToRaw.convertToRaw(result);

    // applying constraints validates and may possibly resolve
    const timexCandidates = Array.from(new Set(result.resolution.values.map(v => v.timex)));
    const timexConstraints = constraints.filter(c => c.type === 'Timex').map(c => c.value);

    const timexSolutions = resolver.evaluate(timexCandidates, timexConstraints);
    if (timexSolutions.length === 1) {
        const solution = new Timex(timexSolutions[0]);

        return { type: 'Timex', timex: solution.timex };
    }

    return undefined;
};

const extractNumber = function (result, constraints) {
    const value = parseFloat(result.resolution.value);
    // TODO apply constraints
    return { type: 'Number', value: value };
};

const extractPercentage = function (result, constraints) {
    const s = result.resolution.value;
    const value = parseFloat(s.substr(0, s.length - 1)) / 100; 
    // TODO apply constraints
    return { type: 'Percentage', value: value };
};

const extractOrdinal = function (result, constraints) {
    const value = parseInt(result.resolution.value);
    // TODO apply constraints
    return { type: 'Ordinal', value: value };
};

const extractTemperature = function (result, constraints) {
    const value = parseFloat(result.resolution.value);
    // TODO apply constraints
    return { type: 'Temperature', value: value, unit: result.resolution.unit };
};

const extractAge = function (result, constraints) {
    const value = parseFloat(result.resolution.value);
    // TODO apply constraints
    return { type: 'Age', value: value, unit: result.resolution.unit };
};

const extractDimension = function (result, constraints) {
    const value = parseFloat(result.resolution.value);
    // TODO apply constraints
    return { type: 'Dimension', value: value, unit: result.resolution.unit };
};

const lookupStandardCodes = function (recognizerCurrencyCode) {
    const standardCurrencyCode = {
        Pound: 'GBP',
        'Japanese yen': 'JPY',
        Dollar: 'USD',
        Euro: 'EUR'
        // TODO add many more currency, refer to https://www.iso.org/iso-4217-currency-codes.html
        // Also refer to https://github.com/Microsoft/Recognizers-Text/issues/193
    }[recognizerCurrencyCode] || 'USD';

    return standardCurrencyCode;
};

const extractCurrency = function (result, constraints) {
    const value = parseFloat(result.resolution.value);
    const currency = lookupStandardCodes(result.resolution.unit);
    // TODO apply constraints
    return { type: 'Currency', value: value, currency: currency };
};

module.exports = {
    extractDateTime: extractDateTime,
    extractNumber: extractNumber,
    extractPercentage: extractPercentage,
    extractOrdinal: extractOrdinal,
    extractTemperature: extractTemperature,
    extractAge: extractAge,
    extractDimension: extractDimension,
    extractCurrency: extractCurrency
};
