/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { MainDialog } = require('../dialogs/mainDialog');
const { BookingDialog } = require('../dialogs/bookingDialog');
const assert = require('assert');

const BOOKING_DIALOG = 'bookingDialog';


class MockLuisHelper {

    static async executeLuisQuery(logger, context) {

        return {
            origin: 'Paris',
            destination: 'Berlin',
            travelDate: '2022-02-22',
        }
    }
}

describe('mainDialog', function() {

    const bookingDialog = new BookingDialog(BOOKING_DIALOG);
   
    it('should create a DialogTestClient', async function() {
        let client = new DialogTestClient();
        assert(client instanceof DialogTestClient, 'Created an invalid object');
    });

    let tests = require('./testData/mainDialogTestCases.js');

    let dialog = new MainDialog(null, MockLuisHelper, bookingDialog);

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

                if (test.steps[i][1]===null) {
                    assert(reply == test.steps[i][1],`${ reply ? reply.text : null } != ${ test.steps[i][1] }`);
                } else {
                    assert(reply.text == test.steps[i][1],`${ reply ? reply.text : null } != ${ test.steps[i][1] }`);
                }
            }
            console.log(`Dialog result: ${ client.dialogTurnResult.result }`);
            if (test.expectedResult !== undefined) {
                assert(test.expectedResult == client.dialogTurnResult.result, `${ test.expectedResult } != ${ client.dialogTurnResult.result }`);
            }
            if (test.expectedStatus !== undefined) {
                assert(test.expectedStatus == client.dialogTurnResult.status, `${ test.expectedStatus } != ${ client.dialogTurnResult.status }`);
            }

        });
    }

    it('should warn when luis is not configured', async function() {

        let md = new MainDialog(null, null, bookingDialog);
        client = new DialogTestClient(md, null, [new DialogTestLogger()]);
        let reply = await client.sendActivity('hi');
        assert(reply.text == 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.', 'Did not warn about missing luis');
    });

});

