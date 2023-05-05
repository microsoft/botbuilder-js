// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { jwt } = require('botbuilder-test-utils');
const { JwtTokenExtractor } = require('../../lib/auth/jwtTokenExtractor');
const { StatusCodes } = require('../../../botframework-schema');

describe('JwtTokenExtractor', function () {
    jwt.mocha();

    const initialize = () => {
        const { algorithm, issuer, metadata, sign, verify } = jwt.stub();

        const client = new JwtTokenExtractor(
            {
                issuer,
            },
            metadata,
            [algorithm]
        );

        return { client, issuer, sign, verify };
    };

    describe('getIdentityFromAuthHeader', function () {
        it('works end-to-end', async function () {
            const { client, issuer, sign, verify } = initialize();

            const key = 'value';

            const token = sign({ key });
            const identity = await client.getIdentityFromAuthHeader(`Bearer ${token}`);

            assert.strictEqual(identity.claims.find((c) => c.type === 'iss').value, issuer);
            assert.strictEqual(identity.claims.find((c) => c.type === 'key').value, key);

            verify();
        });
    });

    describe('validateToken', function () {
        it('throws with expired token', async function () {
            const { algorithm, issuer, metadata, sign } = jwt.stub();
            const key = 'value';
            const token = sign({ key });

            const client = new JwtTokenExtractor(
                {
                    issuer,
                    clockTimestamp: Date.now(),
                    clockTolerance: -10,
                },
                metadata,
                [algorithm]
            );

            await assert.rejects(client.getIdentityFromAuthHeader(`Bearer ${token}`), {
                message: 'The token has expired',
                statusCode: StatusCodes.UNAUTHORIZED,
            });
        });
    });
});
