/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { DateResolverDialog } = require('../../dialogs/dateResolverDialog');
const assert = require('assert');

describe('DateResolverDialog', () => {
    const testCases = require('./testData/dateResolverTestCases.js');
    const sut = new DateResolverDialog('dateResolver');

    testCases.map(testData => {
        it(testData.name, async () => {
            console.log(`Test Case: ${ testData.name }`);
            console.log(`Dialog Input ${ JSON.stringify(testData.initialData) }`);
            const client = new DialogTestClient('test', sut, testData.initialData, [new DialogTestLogger()]);

            for (let i = 0; i < testData.steps.length; i++) {
                const reply = await client.sendActivity(testData.steps[i][0]);
                assert.strictEqual((reply ? reply.text : null), testData.steps[i][1],`${ reply ? reply.text : null } != ${ testData.steps[i][1] }`);
            }
            console.log(`Dialog result: ${ client.dialogTurnResult.result }`);
            assert.strictEqual(client.dialogTurnResult.result, testData.expectedResult, `${ testData.expectedResult } != ${ client.dialogTurnResult.result }`);
        });
    })
});
