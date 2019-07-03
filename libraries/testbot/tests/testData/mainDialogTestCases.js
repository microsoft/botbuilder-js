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
        expectedStatus: 'waiting',
        steps: [
            ['hi', 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"'],
            ['Book a flight from Paris to Berlin on March 22, 2020', 'Please confirm, I have you traveling to: Berlin from: Paris on: 2022-02-22. (1) Yes or (2) No'],
            ['yes', 'I have you booked to Berlin from Paris on 22nd Februrary 2022.']
        ],
    // },
    // {
    //     name: 'No at confirm',
    //     expectedStatus: 'waiting',
    //     steps: [
    //         ['hi', 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"'],
    //         ['Book a flight from Paris to Berlin on March 22, 2020', 'Please confirm, I have you traveling to: Berlin from: Paris on: 2022-02-22. (1) Yes or (2) No'],
    //         ['no', 'Thank you.'],
    //         ['uhhh....','What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"']
    //     ],
    // },
    // {
    //     name: 'help at menu',
    //     expectedStatus: 'waiting',
    //     steps: [
    //         ['hi', 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"'],
    //         ['help','[ This is where to send sample help to the user... ]'],
    //         ['ok', 'Thank you.'],
    //     ],
    // },
    // {
    //     name: 'cancel at menu',
    //     expectedStatus: 'waiting',
    //     steps: [
    //         ['hi', 'What can I help you with today?\nSay something like "Book a flight from Paris to Berlin on March 22, 2020"'],
    //         ['cancel','Cancelling'],
    //         [null, 'Thank you.'],
    //     ],
    },

]