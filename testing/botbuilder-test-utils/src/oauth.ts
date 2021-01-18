// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import nock from 'nock';

/**
 * Registers mocha hooks for proper usage
 */
export function mocha(): void {
    before(() => nock.disableNetConnect());
    beforeEach(() => nock.cleanAll());
    after(() => nock.enableNetConnect());
    afterEach(() => nock.cleanAll());
}

export type Options = {
    accessToken: string;
    host: string;
    path: string;
    tenant: string;
    tokenType: string;
};

export type Result = {
    accessToken: string;
    match: (scope: nock.Scope) => nock.Scope;
    verify: (skipped: boolean) => void;
    tokenType: string;
};

/**
 * Stub Oauth flow.
 *
 * @param {Partial<Options>} options options for stubbing oauth
 * @returns {Result} helpers for stubbed oauth
 */
export function stub(options: Partial<Options> = {}): Result {
    const {
        accessToken = 'access_token',
        host = 'https://login.microsoftonline.com',
        path = '/oauth2/token',
        tenant = 'botframework.com',
        tokenType = 'Bearer',
    } = options;

    const expectation = nock(host)
        .post((uri) => uri.indexOf(`/${tenant}${path}`) !== -1)
        .reply(200, { access_token: accessToken, token_type: tokenType });

    const match = (scope: nock.Scope): nock.Scope => scope.matchHeader('Authorization', `${tokenType} ${accessToken}`);

    return {
        accessToken,
        match,
        verify: (skipped = false) => {
            if (skipped) {
                assert(!expectation.isDone(), 'expected oauth request to be skipped');
            } else {
                expectation.done();
            }
        },
        tokenType,
    };
}
