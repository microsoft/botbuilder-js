// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const http = require('http');
const nock = require('nock');
const sinon = require('sinon');
const { HttpRequestUtils } = require('../../lib/qnamaker-utils/httpRequestUtils');

describe('HttpRequestUtils', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = sinon.createSandbox();

        nock.cleanAll();
        nock.disableNetConnect();
    });

    beforeEach(() => {
        sandbox.restore();

        nock.cleanAll();
        nock.enableNetConnect();
    });

    const endpoint = {
        knowledgeBaseId: 'knowledgeBaseId',
        endpointKey: 'endpointKey',
        host: `https://localhost/qnamaker`,
    };

    describe('executeHttpRequest', () => {
        it('returns JSON result from Train API response of 204 No-Content', async () => {
            const expect = nock(endpoint.host).post('/api').reply(204);

            const httpUtils = new HttpRequestUtils();
            const res = await httpUtils.executeHttpRequest(
                `${endpoint.host}/api`,
                JSON.stringify({ foo: 'bar' }),
                endpoint
            );
            assert.strictEqual(res.answer, '204 No-Content');

            expect.done();
        });

        it('throws when payload to QnA Service is malformed', async () => {
            const expect = nock(endpoint.host)
                .post('/api')
                .replyWithError({
                    error: {
                        code: 12,
                        message: 'Parameter is null',
                        target: null,
                        details: null,
                        innerError: null,
                    },
                });

            const httpUtils = new HttpRequestUtils();
            await assert.rejects(
                httpUtils.executeHttpRequest(
                    `${endpoint.host}/api`,
                    JSON.stringify({
                        foo: 'bar',
                    }),
                    endpoint
                )
            );

            expect.done();
        });

        it('uses an HTTP agent', async () => {
            const agent = new http.Agent({ keepAlive: true });
            sandbox.mock(agent).expects('createConnection').once().callThrough();

            const httpUtils = new HttpRequestUtils(() => agent);
            await assert.rejects(httpUtils.executeHttpRequest('http://localhost:3000', 'payload', {}, undefined), {
                name: 'FetchError',
            });

            sandbox.verify();
        });
    });
});
