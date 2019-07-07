/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { MainDialog } = require('../dialogs/mainDialog');
const { BookingDialog } = require('../dialogs/bookingDialog');
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
    const testCases = require('./testData/mainDialogTestCases');
    const bookingDialog = new BookingDialog(BOOKING_DIALOG);
    const mockRecognizer = new MockFlightBookingRecognizer();
    const sut = new MainDialog(null, mockRecognizer, bookingDialog);

    testCases.map(testData => {
        it(testData.name, async () => {
            console.log(`Test Case: ${ testData.name }`);
            console.log(`Dialog Input ${ JSON.stringify(testData.initialData) }`);
            const client = new DialogTestClient('test', sut, testData.initialData, [new DialogTestLogger()]);

            for (let i = 0; i < testData.steps.length; i++) {
                let reply;
                if (testData.steps[i][0] == null) {
                    reply = client.getNextReply();
                } else {
                    reply = await client.sendActivity(testData.steps[i][0]);
                }

                if (testData.steps[i][1]===null) {
                    assert(reply == testData.steps[i][1],`${ reply ? reply.text : null } != ${ testData.steps[i][1] }`);
                } else {
                    assert(reply.text == testData.steps[i][1],`${ reply ? reply.text : null } != ${ testData.steps[i][1] }`);
                }
            }
            console.log(`Dialog result: ${ client.dialogTurnResult.result }`);
            if (testData.expectedResult !== undefined) {
                assert(testData.expectedResult == client.dialogTurnResult.result, `${ testData.expectedResult } != ${ client.dialogTurnResult.result }`);
            }
            if (testData.expectedStatus !== undefined) {
                assert(testData.expectedStatus == client.dialogTurnResult.status, `${ testData.expectedStatus } != ${ client.dialogTurnResult.status }`);
            }
        });
    });

    it('should warn when luis is not configured', async () => {
        const sut = new MainDialog(null, null, bookingDialog);
        client = new DialogTestClient('test', sut, null, [new DialogTestLogger()]);
        const reply = await client.sendActivity('hi');
        assert(reply.text == 'NOTE: LUIS is not configured. To enable all capabilities, add `LuisAppId`, `LuisAPIKey` and `LuisAPIHostName` to the .env file.', 'Did not warn about missing luis');
    });
});

