/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const assert = require('assert');
const sinon = require('sinon');
const { BlobsStorage } = require('../lib');

const connectionString = process.env.AZURE_BLOB_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_BLOB_STORAGE_CONTAINER;

const maybeClient = () =>
    connectionString && containerName ? new BlobsStorage(connectionString, containerName) : null;

describe('BlobsStorage', () => {
    const client = maybeClient();
    const maybeIt = client ? it : it.skip;

    const foo = { foo: 'foo' };
    const bar = { bar: 'bar' };

    describe('constructor()', () => {
        it('throws for bad args', () => {
            assert.throws(() => new BlobsStorage(), 'throws for missing connectionString');
            assert.throws(() => new BlobsStorage('connectionString'), 'throws for missing containerName');
        });

        it('succeeds for good args', () => {
            new BlobsStorage('UseDevelopmentStorage=true;', 'container');
        });
    });

    describe('write()', () => {
        maybeIt('should throw for bad args', async () => {
            await assert.rejects(() => client.write());
        });

        maybeIt('should write a set of values', async () => {
            await client.write({ foo, bar });
        });
    });

    describe('delete()', () => {
        if (client) {
            beforeEach(async () => {
                await client.write({ foo, bar });
            });
        }

        maybeIt('should throw for a bad key', async () => {
            await assert.rejects(() => client.read(['']));
        });

        maybeIt('should delete one key', async () => {
            await client.delete(['foo']);
        });

        maybeIt('should delete two keys', async () => {
            await client.delete(['foo', 'bar']);
        });

        maybeIt('should not yield an error if one key is missing', async () => {
            await client.delete(['foo', 'baz']);
        });
    });

    describe('read()', () => {
        if (client) {
            before(async () => {
                await client.write({ foo, bar });
            });
        }

        let sandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox({});
        });

        afterEach(() => {
            sandbox.restore();
        });

        const omitETags = (results) =>
            Object.entries(results).reduce((acc, [key, { eTag, ...change }]) => {
                assert(eTag != null, 'eTag exists');
                return { ...acc, [key]: change };
            }, {});

        maybeIt('should read one key', async () => {
            const results = await client.read(['foo']);
            assert.deepStrictEqual(omitETags(results), { foo });
        });

        maybeIt('should read two keys', async () => {
            const results = await client.read(['foo', 'bar']);
            assert.deepStrictEqual(omitETags(results), { foo, bar });
        });

        maybeIt('should not yield an error if one key is missing', async () => {
            const results = await client.read(['foo', 'baz']);
            assert.deepStrictEqual(omitETags(results), { foo });
        });

        maybeIt('should throw an error that is not ignored', async () => {
            const stub = sandbox.stub(client._containerClient, 'getBlobClient');
            stub.withArgs('foo').throwsArg(0);
            await assert.rejects(() => client.read(['foo']));
        });
    });
});
