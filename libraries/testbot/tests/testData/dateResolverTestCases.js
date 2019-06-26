/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
let now = new Date();

let tomorrow = formatDate(new Date().setDate(now.getDate() + 1));
let day_after_tomorrow = formatDate(new Date().setDate(now.getDate() + 2));

// Source: https://stackoverflow.com/questions/23593052/format-javascript-date-to-yyyy-mm-dd
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

module.exports = [
    {
        name: 'tomorrow',
        initialData: null,
        expectedResult: tomorrow,
        steps: [
            ['hi', 'On what date would you like to travel?'],
            ['tomorrow', null],
        ],
    },
    {
        name: 'day after tomorrow',
        initialData: null,
        expectedResult: day_after_tomorrow,
        steps: [
            ['hi', 'On what date would you like to travel?'],
            ['the day after tomorrow', null],
        ],
    },
    {
        name: '2 days from now',
        initialData: null,
        expectedResult: day_after_tomorrow,
        steps: [
            ['hi', 'On what date would you like to travel?'],
            ['2 days from now', null],
        ],
    },
    {
        name: 'valid input given (tomorrow)',
        initialData: {date: tomorrow},
        expectedResult: tomorrow,
        steps: [
            ['hi', null],
        ],
    },
    {
        name: 'retry prompt',
        initialData: {},
        expectedResult: tomorrow,
        steps: [
            ['hi', 'On what date would you like to travel?'],
            ['bananas', 'I\'m sorry, for best results, please enter your travel date including the month, day and year.'],
            ['tomorrow', null]
        ],
    },
    {
        name: 'fuzzy time',
        initialData: {
        },
        expectedResult: '2055-05-05',
        steps: [
            ['hi', 'On what date would you like to travel?'],
            ['may 5th', 'I\'m sorry, for best results, please enter your travel date including the month, day and year.'],
            ['may 5th 2055', null]
        ],
    }
]