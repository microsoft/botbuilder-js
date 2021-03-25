// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServiceCollection, plugin } from '../src';
import { ok, strictEqual } from 'assert';

class Value {
    constructor(public readonly value: string) {}
}

interface TestServices {
    value: Value;
}

describe('Plugin', function () {
    it('works', async function () {
        const fn = plugin<TestServices>(async (services, configuration) => {
            const value = (await configuration.get(['value'])) ?? '';
            ok(typeof value === 'string');

            services.addInstance('value', new Value(value));
        });

        const services = new ServiceCollection<TestServices>();

        const map = new Map([['value', 'howdy!']]);

        await fn(services, {
            get: (path) => Promise.resolve(map.get(path.join(':'))),
            set: () => Promise.resolve(),
        });

        const value = await services.mustMakeInstance('value');
        strictEqual(value.value, 'howdy!');
    });
});
