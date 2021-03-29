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

describe('ServiceCollection', () => {
    const makeServiceCollection = (defaultServices: Partial<TestServices> = {}) => {
        const services = new ServiceCollection(defaultServices);

        services.addInstance('foo', new Foo());
        services.addFactory<Bar, { foo: Foo }>('bar', ['foo'], async ({ foo }) => new Bar(foo));
        services.addFactory<Baz, { foo: Foo; bar: Bar }>('baz', ['foo', 'bar'], ({ foo, bar }) => new Baz(foo, bar));

        return services;
    };

    describe('makeInstances', () => {
        it('works', async () => {
            const services = makeServiceCollection();

            const { foo, bar, baz, bil } = await services.mustMakeInstances<{
                foo: Foo;
                bar: Bar;
                baz: Baz;
                bil?: unknown;
            }>('foo', 'bar', 'baz');

            ok(bil === undefined);

            strictEqual(bar.foo, foo);
            strictEqual(baz.bar, bar);
            strictEqual(baz.bar.foo, foo);
        });

        describe('providing defaults', () => {
            it('initialValue style', async () => {
                const services = new ServiceCollection();

                services.addFactory<number[]>('values', async (values = [1]) => values.concat(2));
                services.composeFactory<number[]>('values', async (values) => values.concat(3));

                const { values } = await services.makeInstances();
                deepStrictEqual(values, [1, 2, 3]);
            });

            it('constructor style', async () => {
                const services = new ServiceCollection({
                    values: [1],
                });

                services.composeFactory<number[]>('values', async (values) => values.concat(2));
                services.composeFactory<number[]>('values', async (values) => values.concat(3));

                const { values } = await services.makeInstances();
                deepStrictEqual(values, [1, 2, 3]);
            });
        });
    });

    describe('mustMakeInstances', () => {
        it('throws if a service instance is undefined', async () => {
            const services = new ServiceCollection();
            await rejects(services.mustMakeInstances('value'));
        });
    });

    describe('makeInstance', () => {
        it('uses cached dependencies by default', async () => {
            const services = makeServiceCollection();

            const { bar, baz } = await services.mustMakeInstances<{ bar: Bar; baz: Baz }>('bar', 'baz');
            const newBaz = await services.mustMakeInstance<Baz>('baz');

            notStrictEqual(newBaz, baz);
            strictEqual(newBaz.bar, bar);
        });

        it('optionally fully reconstructs dependencies', async () => {
            const services = makeServiceCollection();

            const { foo, bar, baz } = await services.makeInstances();
            ok(foo);
            ok(bar);
            ok(baz);

            const newBaz = await services.makeInstance<Baz>('baz', true);
            ok(newBaz);

            notStrictEqual(newBaz, baz);
            notStrictEqual(newBaz.bar, bar);
        });
    });

    describe('mustMakeInstance', () => {
        it('throws if a service instance is undefined', async () => {
            const services = new ServiceCollection();
            await rejects(services.mustMakeInstance('value'));
        });
    });

    describe('factory handling', () => {
        it('works', async () => {
            const services = new ServiceCollection({
                a: {},
                b: {},
            });

            services.composeFactory<{ a: Record<string, unknown>; b: Record<string, unknown> }>('a', (a) => ({
                ...a,
                key: 'value',
            }));
            services.composeFactory<Record<string, unknown>, Record<string, Record<string, unknown>>>(
                'b',
                ['a'],
                ({ a }, b) => ({ ...a, ...b })
            );

            const a = await services.mustMakeInstance('a');
            deepStrictEqual(a, { key: 'value' });
        });

        it('throws for undefined initial value', async () => {
            const services = new ServiceCollection({
                a: {},
            });

            services.composeFactory<Record<string, unknown>, Record<string, Record<string, unknown>>>(
                'b',
                ['a'],
                ({ a }, b) => ({ ...a, ...b })
            );
            await rejects(services.makeInstance('b'));
        });
    });
});
