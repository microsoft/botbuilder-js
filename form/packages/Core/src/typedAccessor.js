// Copyright (c) Microsoft Corporation. All rights reserved.

const formatOrdinal = function (value) {
    const s = value.toString();
    let t = '';
    switch (s[s.length - 1]) {
        case '1':
            t = 'st';
            break;
        case '2':
            t = 'nd';
            break;
        default:
            t = 'th';
    }
    return s + t;
};

const toNaturalLanguage = function (obj) {
    if (!('type' in obj)) {
        return '';
    }
    switch (obj.type) {
        case 'Timex': {
            return obj.timex;
        }
        case 'Number': {
            const formatter = new Intl.NumberFormat('en-US', { style: 'decimal' });
            return formatter.format(obj.value);
        }
        case 'Percentage': {
            const formatter = new Intl.NumberFormat('en-US', { style: 'percent' });
            return formatter.format(obj.value);
        }
        case 'Ordinal': {
            return formatOrdinal(obj.value);
        }
        case 'Temperature': {
            return `${obj.value} ${obj.unit}`;
        }
        case 'Age': {
            return `${obj.value} ${obj.unit}`;
        }
        case 'Dimension': {
            return `${obj.value} ${obj.unit}`;
        }
        case 'Currency': {
            const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: obj.currency });
            return formatter.format(obj.value);
        }
        default:
            return '';
    }
};

module.exports.toNaturalLanguage = toNaturalLanguage;
