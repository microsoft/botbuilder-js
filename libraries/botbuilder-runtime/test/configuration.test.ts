// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import path from 'path';
import { Configuration } from '../src/configuration';

describe('Configuration', () => {
    const makeConfiguration = (files = ['base.json']) => {
        const configuration = new Configuration();

        files.forEach((file) => configuration.file(path.join(__dirname, 'settings', file)));

        configuration.argv(['--strings.argv', 'argv']);

        process.env['strings__env'] = 'env';
        configuration.env();

        return configuration;
    };

    describe('flags', () => {
        it('works', () => {
            const flags = makeConfiguration().bind(['flags']);

            assert.strictEqual(flags.bool(['on']), true);
            assert.strictEqual(flags.bool(['off']), false);
            assert.throws(() => flags.bool(['bad']));
        });
    });

    describe('strings', () => {
        it('works', () => {
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

    describe('nesting and layering', () => {
        it('works', () => {
            const base = makeConfiguration();
            assert.strictEqual(base.get(['root', 'key']), 'base');

            const layered = makeConfiguration(['layer.json', 'base.json']);
            assert.strictEqual(layered.get(['root', 'key']), 'layer');
        });
    });
});
