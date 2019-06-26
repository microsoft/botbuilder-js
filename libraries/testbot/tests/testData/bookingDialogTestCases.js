/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
let now = new Date();

let tomorrow = formatDate(new Date().setDate(now.getDate() + 1));

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
        name: 'Happy Path',
        initialData: {
            destination: 'Seattle',
            origin: 'New York',
            travelDate: '2022-02-22'
        },
        steps: [
            ['hi', 'Please confirm, I have you traveling to: Seattle from: New York on: 2022-02-22. (1) Yes or (2) No'],
            ['yes', null],
        ],
    },
    {
        name: 'Full Run Path',
        initialData: {
        },
        expectedStatus: 'complete',
        steps: [
            ['hi', 'To what city would you like to travel?'],
            ['Seattle','From what city will you be travelling?'],
            ['New York', 'On what date would you like to travel?'],
            ['2022-02-22', 'Please confirm, I have you traveling to: Seattle from: New York on: 2022-02-22. (1) Yes or (2) No'],
            ['yes',null]
        ],
    },
    {
        name: 'no to confirm',
        initialData: {
            destination: 'Seattle',
            origin: 'New York',
            travelDate: '2022-02-22'
        },
        expectedResult: null,
        steps: [
            ['hi', 'Please confirm, I have you traveling to: Seattle from: New York on: 2022-02-22. (1) Yes or (2) No'],
            ['no', null],
        ],
    },
    {
        name: 'cancel at confirm',
        initialData: {
            destination: 'Seattle',
            origin: 'New York',
            travelDate: '2022-02-22'
        },
        expectedResult: null,
        expectedStatus: 'complete',
        steps: [
            ['hi', 'Please confirm, I have you traveling to: Seattle from: New York on: 2022-02-22. (1) Yes or (2) No'],
            ['cancel', 'Cancelling']
        ],
    },
    {
        name: 'help at confirm',
        initialData: {
            destination: 'Seattle',
            origin: 'New York',
            travelDate: '2022-02-22'
        },
        expectedStatus: 'complete',
        steps: [
            ['hi', 'Please confirm, I have you traveling to: Seattle from: New York on: 2022-02-22. (1) Yes or (2) No'],
            ['help', '[ This is where to send sample help to the user... ]'],
            ['hi', 'Please confirm, I have you traveling to: Seattle from: New York on: 2022-02-22. (1) Yes or (2) No'],
            ['yes', null]
        ],
   },
]