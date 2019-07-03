/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { BookingDialog } = require('../dialogs/bookingDialog');
const assert = require('assert');

describe('BookingDialog', function() {
    it('should create a DialogTestClient', async function() {
        let client = new DialogTestClient();
        assert(client instanceof DialogTestClient, 'Created an invalid object');
    });

    let tests = require('./testData/bookingDialogTestCases.js');

    let dialog = new BookingDialog('bookingDialog');

    for (let t = 0; t < tests.length; t++) {
        let test = tests[t];
        it(test.name, async function() {
            console.log(`Test Case: ${ test.name }`);
            console.log(`Dialog Input ${ JSON.stringify(test.initialData) }`);
            let client = new DialogTestClient(dialog, test.initialData, [new DialogTestLogger()]);

            for (let i = 0; i < test.steps.length; i++) {
                let reply;
                if (test.steps[i][0] == null) {
                    reply = await client.getNextReply();
                } else {
                    reply = await client.sendActivity(test.steps[i][0]);
                }
                assert((reply ? reply.text : null) == test.steps[i][1],`${ reply ? reply.text : null } != ${ test.steps[i][1] }`);
			}

            console.log(`Dialog result: ${ JSON.stringify(client.dialogTurnResult.result) }`);
            if (test.expectedResult !== undefined) {
                if (test.expectedResult != null && typeof(test.expectedResult) =='object') {
                    assert(isEquivalent(test.expectedResult, client.dialogTurnResult.result), `${ JSON.stringify(test.expectedResult) } != ${ JSON.stringify(client.dialogTurnResult.result) }`);
                } else {
                    assert(test.expectedResult == client.dialogTurnResult.result, `${ test.expectedResult } != ${ client.dialogTurnResult.result }`);
                }
			}

            if (test.expectedStatus !== undefined) {
                assert(test.expectedStatus == client.dialogTurnResult.status, `${ test.expectedStatus } != ${ client.dialogTurnResult.status }`);
            }
        });
    }
});

// from http://adripofjavascript.com/blog/drips/object-equality-in-javascript.html
function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}