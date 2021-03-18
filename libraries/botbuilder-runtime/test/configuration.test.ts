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
        it('works', async () => {
            const flags = makeConfiguration().bind(['flags']);

            assert.strictEqual(await flags.bool(['on']), true);
            assert.strictEqual(await flags.bool(['off']), false);
            await assert.rejects(flags.bool(['bad']));
        });
    });

    describe('strings', () => {
        it('works', async () => {
            const strings = makeConfiguration().bind(['strings']);

            assert.strictEqual(await strings.string(['ok']), 'howdy');
            await assert.rejects(strings.string(['bad']));

            assert.strictEqual(await strings.string(['unset']), undefined);
            strings.set(['unset'], 'set');
            assert.strictEqual(await strings.string(['unset']), 'set');

            assert.strictEqual(await strings.string(['env']), 'env');
            assert.strictEqual(await strings.string(['argv']), 'argv');
        });
    });

    describe('nesting and layering', () => {
        it('works', async () => {
            const base = makeConfiguration();
            assert.strictEqual(await base.get(['root', 'key']), 'base');

            const layered = makeConfiguration(['layer.json', 'base.json']);
            assert.strictEqual(await layered.get(['root', 'key']), 'layer');
        });
    });
});
