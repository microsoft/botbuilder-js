// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import forge from 'node-forge';
import jwt from 'jsonwebtoken';
import nock from 'nock';
import url from 'url';
import { assert } from 'botbuilder-stdlib';
import { nanoid } from 'nanoid';
import { ok } from 'assert';

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
    algorithm: string;
    bits: number;
    expiresIn: number;
    host: string;
    issuer: string;
    jwks: Partial<url.Url>;
    keyId: string;
    metadata: Partial<url.Url>;
};

export type Result = {
    algorithm: string;
    host: string;
    issuer: string;
    jwks: string;
    keyId: string;
    metadata: string;
    sign: (payload: Record<string, string>) => string;
    verify: () => void;
};

// encodes a forge big int as a base64 string
const encodeBigInt = (bigInt: forge.jsbn.BigInteger): string =>
    // Note: the @types declarations for forge are wrong, `toString` does take a base.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forge.util.encode64(forge.util.hexToBytes((bigInt as any).toString(16)));

const formatHost = (url: url.Url): string => `${url.protocol}//${url.host}`;

/**
 * This allows callers to stub Open ID/JWKS key fetching. In effect, this allows callers
 * to create signed JWTs in the tests that can be verified by code that fetches signing
 * keys via Open ID/JWKS spec.
 *
 * @param {Partial<Options>} options options for stubbing jwt
 * @returns {Result} helpers for stubbed jwt
 */
export function stub(options: Partial<Options> = {}): Result {
    const {
        algorithm = 'RS256',
        bits = 2048,
        expiresIn = 1000 * 60 * 5,
        host = `https://${nanoid()}.jwt.localhost`,
        issuer = 'iss',
        jwks = { path: '/v1/.well-known/jwks' },
        keyId = nanoid(),
        metadata = { path: '/v1/.well-known/openid' },
    } = options;

    const { publicKey, privateKey } = forge.pki.rsa.generateKeyPair(bits);

    const sign = (payload: Record<string, string>): string =>
        jwt.sign(payload, forge.pki.privateKeyToPem(privateKey), {
            algorithm,
            expiresIn,
            issuer,
            keyid: keyId,
        });

    const hostURL = url.parse(host);

    const metadataURL = Object.assign({}, hostURL, metadata);
    assert.string(metadataURL.path, ['metadata', 'path']);

    const jwksURL = Object.assign({}, hostURL, jwks);
    assert.string(jwksURL.path, ['jwks', 'path']);

    const openIdExpectation = nock(formatHost(metadataURL))
        .get(metadataURL.path)
        .reply(200, {
            issuer,
            jwks_uri: `${formatHost(jwksURL)}${jwksURL.path}`,
        });

    const jwksExpectation = nock(formatHost(jwksURL))
        .get(jwksURL.path)
        .reply(200, {
            keys: [
                {
                    kty: 'RSA',
                    use: 'sig',
                    kid: keyId,
                    n: encodeBigInt(publicKey.n),
                    e: encodeBigInt(publicKey.e),
                    alg: algorithm,
                },
            ],
        });

    return {
        algorithm,
        host,
        issuer,
        jwks: `${formatHost(jwksURL)}${jwks.path}`,
        keyId,
        metadata: `${formatHost(metadataURL)}${metadata.path}`,
        sign,
        verify: (skipped = false) => {
            if (skipped) {
                ok(!openIdExpectation.isDone(), 'expected open ID request to be skipped');
                ok(!jwksExpectation.isDone(), 'expected jwks request to be skipped');
            } else {
                openIdExpectation.done();
                jwksExpectation.done();
            }
        },
    };
}
