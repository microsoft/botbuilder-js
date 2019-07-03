/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { MainDialog } = require('../dialogs/mainDialog');
const { BookingDialog } = require('../dialogs/bookingDialog');
const tests = require('./testData/mainDialogTestCases');
const assert = require('assert');

const BOOKING_DIALOG = 'bookingDialog';

class MockFlightBookingRecognizer {
    constructor(config) {
        this.config = config;
    }
    async executeLuisQuery(logger, context) {
        return {
            origin: 'Paris',
            destination: 'Berlin',
            travelDate: '2022-02-22',
        }
    }
    isConfigured() {
        return true;
    }
}

describe('MainDialog', function() {

    const bookingDialog = new BookingDialog(BOOKING_DIALOG);

    it('should create a DialogTestClient', async () => {
        const client = new DialogTestClient();
        assert(client instanceof DialogTestClient, 'Created an invalid object');
    });

    const mockRecognizer = new MockFlightBookingRecognizer();
    const dialog = new MainDialog(null, mockRecognizer, bookingDialog);

    tests.map(test => {
        it(test.name, async () => {
            console.log(`Test Case: ${ test.name }`);
            console.log(`Dialog Input ${ JSON.stringify(test.initialData) }`);
            const client = new DialogTestClient(dialog, test.initialData, [new DialogTestLogger()]);

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
    });

    it('should warn when luis is not configured', async () => {
        const md = new MainDialog(null, null, bookingDialog);
        client = new DialogTestClient(md, null, [new DialogTestLogger()]);
        const reply = await client.sendActivity('hi');
        assert(reply.text == 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.', 'Did not warn about missing luis');
    });

});

