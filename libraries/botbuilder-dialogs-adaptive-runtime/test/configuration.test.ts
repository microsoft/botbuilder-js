// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import path from 'path';
import { Configuration } from '../src/configuration';

describe('Configuration', function () {
    const makeConfiguration = (files = ['base.json']) => {
        const configuration = new Configuration();

        files.forEach((file) => configuration.file(path.join(__dirname, 'settings', file)));

        configuration.argv(['--strings.argv', 'argv']);

        process.env['strings__env'] = 'env';
        configuration.env();

        return configuration;
    };

    describe('flags', function () {
        it('works', async function () {
            const flags = makeConfiguration().bind(['flags']);

            assert.strictEqual(flags.bool(['on']), true);
            assert.strictEqual(flags.bool(['off']), false);
            assert.throws(() => flags.bool(['bad']));
        });
    });

    describe('strings', function () {
        it('works', async function () {
            const strings = makeConfiguration().bind(['strings']);

            assert.strictEqual(strings.string(['ok']), 'howdy');
            assert.throws(() => strings.string(['bad']));

            assert.strictEqual(strings.string(['unset']), undefined);
            strings.set(['unset'], 'set');
            assert.strictEqual(strings.string(['unset']), 'set');

            assert.strictEqual(strings.string(['env']), 'env');
            assert.strictEqual(strings.string(['argv']), 'argv');
        });
    });

    describe('nesting and layering', function () {
        it('works', async function () {
            const base = makeConfiguration();
            assert.strictEqual(base.get(['root', 'key']), 'base');

            const layered = makeConfiguration(['layer.json', 'base.json']);
            assert.strictEqual(layered.get(['root', 'key']), 'layer');
        });
    });

    describe('keys', function () {
        const configuration = new Configuration({
            key: 'value',
            one: {
                key: 'value-one',
                two: {
                    key: 'value-two',
                },
            },
        });

        describe('non-prefixed', function () {
            it('yields a value for a key', function () {
                assert.strictEqual(configuration.get(['key']), 'value');
                assert.strictEqual(configuration.get(['one', 'key']), 'value-one');
            });

            it('yields all values for a key', function () {
                assert.deepStrictEqual(configuration.get(['one']), { key: 'value-one', two: { key: 'value-two' } });
            });

            it('yields all values for no key', function () {
                assert.deepStrictEqual(configuration.get(), {
                    key: 'value',
                    one: { key: 'value-one', two: { key: 'value-two' } },
                });
            });
        });

        describe('prefixed', function () {
            it('yields a value for a key', function () {
                assert.strictEqual(configuration.bind(['one']).get(['key']), 'value-one');
            });

            it('yields all values for a key', function () {
                assert.deepStrictEqual(configuration.bind(['one']).get(['two']), {
                    key: 'value-two',
                });
            });

            it('yields all values for no key', function () {
                assert.deepStrictEqual(configuration.bind(['one']).get(), {
                    key: 'value-one',
                    two: { key: 'value-two' },
                });
            });
        });
    });
});
