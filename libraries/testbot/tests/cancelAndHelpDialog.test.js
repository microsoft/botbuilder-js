/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { DateResolverDialog } = require('../dialogs/dateResolverDialog');
const assert = require('assert');

describe('CancelAndHelpDialog', () => {
    describe('Should be able to cancel', () => {
        const testCases = ['cancel', 'quit'];
        const sut = new DateResolverDialog('dateResolver');

        testCases.map(testData => {
            it(testData, async () => {
                // TODO
            });
        });
    });

    describe('Should be able to get help', () => {
        const testCases = ['help', '?'];
        const sut = new DateResolverDialog('dateResolver');

        testCases.map(testData => {
            it(testData, async () => {
                // TODO
            });
        });
    });
});