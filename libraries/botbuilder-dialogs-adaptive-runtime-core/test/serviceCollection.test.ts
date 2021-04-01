// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import assert from 'assert';
import { ServiceCollection } from '../src/serviceCollection';

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
        const services = new ServiceCollection(defaultServices);

        services.addInstance('foo', new Foo());
        services.addFactory<Bar, { foo: Foo }>('bar', ['foo'], ({ foo }) => new Bar(foo));
        services.addFactory<Baz, { foo: Foo; bar: Bar }>('baz', ['foo', 'bar'], ({ foo, bar }) => new Baz(foo, bar));

        return services;
    };

    describe('makeInstances', function () {
        it('works', function () {
            const services = makeServiceCollection();

            const { foo, bar, baz, bil } = services.mustMakeInstances<{
                foo: Foo;
                bar: Bar;
                baz: Baz;
                bil?: unknown;
            }>('foo', 'bar', 'baz');

            assert.ok(bil === undefined);

            assert.strictEqual(bar.foo, foo);
            assert.strictEqual(baz.bar, bar);
            assert.strictEqual(baz.bar.foo, foo);
        });

        describe('providing defaults', function () {
            it('initialValue style', function () {
                const services = new ServiceCollection();

                services.addFactory<number[]>('values', (values = [1]) => values.concat(2));
                services.composeFactory<number[]>('values', (values) => values.concat(3));

                const { values } = services.makeInstances();
                assert.deepStrictEqual(values, [1, 2, 3]);
            });

            it('constructor style', function () {
                const services = new ServiceCollection({
                    values: [1],
                });

                services.composeFactory<number[]>('values', (values) => values.concat(2));
                services.composeFactory<number[]>('values', (values) => values.concat(3));

                const { values } = services.makeInstances();
                assert.deepStrictEqual(values, [1, 2, 3]);
            });
        });
    });

    describe('mustMakeInstances', function () {
        it('throws if a service instance is undefined', function () {
            const services = new ServiceCollection();
            assert.throws(() => services.mustMakeInstances('value'));
        });
    });

    describe('makeInstance', function () {
        it('uses cached dependencies by default', function () {
            const services = makeServiceCollection();

            const { bar, baz } = services.mustMakeInstances<{ bar: Bar; baz: Baz }>('bar', 'baz');
            const newBaz = services.mustMakeInstance<Baz>('baz');

            assert.notStrictEqual(newBaz, baz);
            assert.strictEqual(newBaz.bar, bar);
        });

        it('optionally fully reconstructs dependencies', function () {
            const services = makeServiceCollection();

            const { foo, bar, baz } = services.makeInstances();
            assert.ok(foo);
            assert.ok(bar);
            assert.ok(baz);

            const newBaz = services.makeInstance<Baz>('baz', true);
            assert.ok(newBaz);

            assert.notStrictEqual(newBaz, baz);
            assert.notStrictEqual(newBaz.bar, bar);
        });
    });

    describe('mustMakeInstance', function () {
        it('throws if a service instance is undefined', function () {
            const services = new ServiceCollection();
            assert.throws(() => services.mustMakeInstance('value'));
        });
    });

    describe('factory handling', function () {
        it('works', function () {
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

            const a = services.mustMakeInstance('a');
            assert.deepStrictEqual(a, { key: 'value' });
        });

        it('throws for undefined initial value', function () {
            const services = new ServiceCollection({
                a: {},
            });

            services.composeFactory<Record<string, unknown>, Record<string, Record<string, unknown>>>(
                'b',
                ['a'],
                ({ a }, b) => ({ ...a, ...b })
            );
            assert.throws(() => services.makeInstance('b'));
        });
    });
});
