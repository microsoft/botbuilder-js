// Copyright (c) Microsoft Corporation. All rights reserved.

const Recognizers = require('recognizers-text');
const resolution = require('./formEntityResolution.js');

const recognize = function (extract, model, field, context) {
    const results = model.parse(context.request.text);
    // we are expecting exactly one result
    if (results.length === 1) {
        const result = extract(results[0], field.constraints);
        // and the entity must match the given constraints
        if (result !== undefined) {
            context.local[field.entity] = result;
            return true;
        }
    }
    return false;
};

const recognizeDateTime = function (field, context) {
    const model = Recognizers.DateTimeRecognizer.instance.getDateTimeModel(Recognizers.Culture.English);
    return recognize(resolution.extractDateTime, model, field, context);
};

const recognizeNumber = function (field, context) {
    const model = Recognizers.NumberRecognizer.instance.getNumberModel(Recognizers.Culture.English);
    return recognize(resolution.extractNumber, model, field, context);
};
    
const recognizePercentage = function (field, context) {
    const model = Recognizers.NumberRecognizer.instance.getPercentageModel(Recognizers.Culture.English);
    return recognize(resolution.extractPercentage, model, field, context);
};

const recognizeOrdinal = function (field, context) {
    const model = Recognizers.NumberRecognizer.instance.getOrdinalModel(Recognizers.Culture.English);
    return recognize(resolution.extractOrdinal, model, field, context);
};

const recognizeTemperature = function (field, context) {
    const model = Recognizers.NumberWithUnitRecognizer.instance.getTemperatureModel(Recognizers.Culture.English);
    return recognize(resolution.extractTemperature, model, field, context);
};

const recognizeAge = function (field, context) {
    const model = Recognizers.NumberWithUnitRecognizer.instance.getAgeModel(Recognizers.Culture.English);
    return recognize(resolution.extractAge, model, field, context);
};

const recognizeDimension = function (field, context) {
    const model = Recognizers.NumberWithUnitRecognizer.instance.getDimensionModel(Recognizers.Culture.English);
    return recognize(resolution.extractDimension, model, field, context);
};

const recognizeCurrency = function (field, context) {
    const model = Recognizers.NumberWithUnitRecognizer.instance.getCurrencyModel(Recognizers.Culture.English);
    return recognize(resolution.extractCurrency, model, field, context);
};

const recognizeString = function (field, context) {
    // then we should just take the whole input verbatim...
    context.local[field.entity] = context.request.text;
    return true;
};

const recognizeSingleEntity = function (formMetadata, entity, context) {
    const field = formMetadata.fields.find(f => f.entity === entity);
    switch (field.dataType) {
        case 'Date':
        case 'Time':
        case 'DateTime':
        case 'TimeRange':
        case 'DateRange':
        case 'DateTimeRange':
        case 'Set':
            return recognizeDateTime(field, context);
        case 'Number':
            return recognizeNumber(field, context);
        case 'Percentage':
            return recognizePercentage(field, context);
        case 'Ordinal':
            return recognizeOrdinal(field, context);
        case 'Temperature':
            return recognizeTemperature(field, context);
        case 'Age':
            return recognizeAge(field, context);
        case 'Dimension':
            return recognizeDimension(field, context);
        case 'Currency':
            return recognizeCurrency(field, context);
        case 'String':
        default:
            return recognizeString(field, context);
    }
};

module.exports.recognizeSingleEntity = recognizeSingleEntity;
