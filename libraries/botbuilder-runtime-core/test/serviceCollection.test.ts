// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServiceCollection } from '../src/serviceCollection';
import { deepStrictEqual, notStrictEqual, ok, rejects, strictEqual } from 'assert';

class Foo {}

class Bar {
    constructor(public foo: Foo) {}
}

class Baz {
    constructor(public foo: Foo, public bar: Bar) {}
}

interface TestServices {
    foo: Foo;
    bar: Bar;
    baz: Baz;
    bil: string;
}

describe('ServiceCollection', function () {
    const makeServiceCollection = (defaultServices: Partial<TestServices> = {}) => {
        const services = new ServiceCollection<TestServices>(defaultServices);

        services.addInstance('foo', new Foo());
        services.addFactory('bar', ['foo'], async ({ foo }) => new Bar(foo));
        services.addFactory('baz', ['foo', 'bar'], ({ foo, bar }) => new Baz(foo, bar));

        return services;
    };

    describe('makeInstances', function () {
        it('works', async function () {
            const services = makeServiceCollection();

            const { foo, bar, baz, bil } = await services.mustMakeInstances('foo', 'bar', 'baz');
            ok(bil === undefined);

            strictEqual(bar.foo, foo);
            strictEqual(baz.bar, bar);
            strictEqual(baz.bar.foo, foo);
        });

        describe('providing defaults', function () {
            it('initialValue style', async function () {
                const services = new ServiceCollection<{ values: number[] }>();

                services.addFactory('values', async (values = [1]) => values.concat(2));
                services.composeFactory('values', async (values) => values.concat(3));

                const { values } = await services.makeInstances();
                deepStrictEqual(values, [1, 2, 3]);
            });

            it('constructor style', async function () {
                const services = new ServiceCollection<{ values: number[] }>({
                    values: [1],
                });

                services.composeFactory('values', async (values) => values.concat(2));
                services.composeFactory('values', async (values) => values.concat(3));

                const { values } = await services.makeInstances();
                deepStrictEqual(values, [1, 2, 3]);
            });
        });
    });

    describe('mustMakeInstances', function () {
        it('throws if a service instance is undefined', async function () {
            const services = new ServiceCollection<{ value: string }>();
            await rejects(services.mustMakeInstances('value'));
        });
    });

    describe('makeInstance', function () {
        it('uses cached dependencies by default', async function () {
            const services = makeServiceCollection();

            const { bar, baz } = await services.mustMakeInstances('bar', 'baz');
            const newBaz = await services.mustMakeInstance('baz');

            notStrictEqual(newBaz, baz);
            strictEqual(newBaz.bar, bar);
        });

        it('optionally fully reconstructs dependencies', async function () {
            const services = makeServiceCollection();

            const { foo, bar, baz } = await services.makeInstances();
            ok(foo);
            ok(bar);
            ok(baz);

            const newBaz = await services.makeInstance('baz', true);
            ok(newBaz);

            notStrictEqual(newBaz, baz);
            notStrictEqual(newBaz.bar, bar);
        });
    });

    describe('mustMakeInstance', function () {
        it('throws if a service instance is undefined', async function () {
            const services = new ServiceCollection<{ value: string }>();
            await rejects(services.mustMakeInstance('value'));
        });
    });

    describe('factory handling', function () {
        it('works', async function () {
            const services = new ServiceCollection<{ a: Record<string, string>; b: Record<string, string> }>({
                a: {},
                b: {},
            });

            services.composeFactory('a', (a) => ({ ...a, key: 'value' }));
            services.composeFactory('b', ['a'], ({ a }, b) => ({ ...a, ...b }));

            const a = await services.makeInstance('a');
            ok(a);
            deepStrictEqual(a, { key: 'value' });
        });

        it('throws for undefined initial value', async function () {
            const services = new ServiceCollection<{ a: Record<string, string>; b: Record<string, string> }>({
                a: {},
            });

            services.composeFactory('b', ['a'], ({ a }, b) => ({ ...a, ...b }));
            await rejects(services.makeInstance('b'));
        });
    });
});
