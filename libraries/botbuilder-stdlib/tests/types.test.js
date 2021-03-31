// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { UndefinedError, assert: typeAssert, tests } = require('../lib/types');

describe('assertType', function () {
    describe('basic', function () {
        const testCases = [
            { label: 'any', assert: typeAssert.any, input: 0, throws: false },
            { label: 'any', assert: typeAssert.any, input: 0, throws: false },
            { label: 'maybeAny', assert: typeAssert.maybeAny, input: null, throws: false },

            { label: 'unknown', assert: typeAssert.unknown, input: 0, throws: false },
            { label: 'maybeUnknown', assert: typeAssert.maybeUnknown, input: null, throws: false },

            { label: 'array', assert: typeAssert.array, input: [], throws: false },
            { label: 'array', assert: typeAssert.array, input: {}, throws: true },
            { label: 'array', assert: typeAssert.array, input: false, throws: true },
            { label: 'maybeArray', assert: typeAssert.maybeArray, input: null, throws: false },

            { label: 'arrayOfString', assert: typeAssert.arrayOfString, input: ['foo'], throws: false },
            { label: 'arrayOfString', assert: typeAssert.arrayOfString, input: [10], throws: true },

            { label: 'boolean', assert: typeAssert.boolean, input: true, throws: false },
            { label: 'boolean', assert: typeAssert.boolean, input: false, throws: false },
            { label: 'boolean', assert: typeAssert.boolean, input: 10, throws: true },
            { label: 'maybeBoolean', assert: typeAssert.maybeBoolean, input: undefined, throws: false },

            { label: 'date', assert: typeAssert.date, input: new Date(), throws: false },
            { label: 'date', assert: typeAssert.date, input: {}, throws: true },
            { label: 'maybeDate', assert: typeAssert.maybeDate, input: null, throws: false },

            { label: 'dictionary', assert: typeAssert.dictionary, input: {}, throws: false },
            { label: 'dictionary', assert: typeAssert.dictionary, input: [], throws: true },
            { label: 'maybeDictionary', assert: typeAssert.maybeDictionary, input: null, throws: false },

            { label: 'object', assert: typeAssert.object, input: {}, throws: false },
            { label: 'object', assert: typeAssert.object, input: [], throws: true },
            { label: 'maybeObject', assert: typeAssert.maybeObject, input: undefined, throws: false },

            { label: 'error', assert: typeAssert.error, input: new Error(), throws: false },
            { label: 'error', assert: typeAssert.error, input: new TypeError(), throws: false },
            { label: 'error', assert: typeAssert.error, input: 'error', throws: true },

            { label: 'typeError', assert: typeAssert.typeError, input: new TypeError(), throws: false },
            { label: 'typeError', assert: typeAssert.typeError, input: new Error(), throws: true },
            { label: 'typeError', assert: typeAssert.typeError, input: false, throws: true },

            { label: 'undefinedError', assert: typeAssert.undefinedError, input: new UndefinedError(), throws: false },
            { label: 'undefinedError', assert: typeAssert.typeError, input: new Error(), throws: true },
            { label: 'undefinedError', assert: typeAssert.typeError, input: false, throws: true },

            { label: 'func', assert: typeAssert.func, input: () => null, throws: false },
            { label: 'func', assert: typeAssert.func, input: new Date(), throws: true },
            { label: 'maybeFunc', assert: typeAssert.maybeFunc, input: null, throws: false },

            { label: 'nil', assert: typeAssert.nil, input: null, throws: false },
            { label: 'nil', assert: typeAssert.nil, input: undefined, throws: false },
            { label: 'nil', assert: typeAssert.nil, input: false, throws: true },

            { label: 'number', assert: typeAssert.number, input: 10, throws: false },
            { label: 'number', assert: typeAssert.number, input: false, throws: true },
            { label: 'number', assert: typeAssert.number, input: NaN, throws: true },
            { label: 'maybeNumber', assert: typeAssert.maybeNumber, input: null, throws: false },

            { label: 'string', assert: typeAssert.string, input: 'hello', throws: false },
            { label: 'string', assert: typeAssert.string, input: '', throws: false },
            { label: 'string', assert: typeAssert.string, input: false, throws: true },
            { label: 'maybeString', assert: typeAssert.maybeString, input: undefined, throws: false },
        ];

        testCases.forEach((testCase) => {
            it(`typeAssert.${testCase.label} with ${JSON.stringify(testCase.input)} ${
                testCase.throws ? 'throws' : 'does not throw'
            }`, function () {
                const test = () => testCase.assert(testCase.input, [testCase.label]);

                if (testCase.throws) {
                    assert.throws(test);
                } else {
                    assert.doesNotThrow(test);
                }
            });
        });

        it('maybeArrayOf works', function () {
            assert.doesNotThrow(() => typeAssert.maybeArrayOf(typeAssert.number)([1, 2, 3], []));
            assert.doesNotThrow(() => typeAssert.maybeArrayOf(typeAssert.number)(undefined, []));
            assert.throws(
                () => typeAssert.maybeArrayOf(typeAssert.number)([1, 2, '3'], ['arr']),
                new TypeError('`arr.[2]` must be of type "number"')
            );
        });

        it('maybeInstanceOf works', function () {
            assert.doesNotThrow(() => typeAssert.maybeInstanceOf('Error', Error)(new Error(), []));
            assert.doesNotThrow(() => typeAssert.maybeInstanceOf('Error', Error)(undefined, []));
            assert.throws(
                () => typeAssert.maybeInstanceOf('Error', Error)('foo', ['err']),
                new TypeError('`err` must be an instance of "Error"')
            );
        });

        it('oneOf works', function () {
            assert.doesNotThrow(() => typeAssert.maybeOneOf(tests.isNumber, tests.isString)(10, []));
            assert.doesNotThrow(() => typeAssert.maybeOneOf(tests.isNumber, tests.isString)('11', []));
            assert.throws(
                () => typeAssert.maybeOneOf(tests.isNumber, tests.isString)(false, ['val']),
                new TypeError('`val` is of wrong type')
            );
        });
    });

    describe('partial', function () {
        const assertBaz = (val, path) => {
            typeAssert.unsafe.castObjectAs(val, path);
            typeAssert.string(val.nested, path.concat('nested'));
        };

        const assertThing = (val, path) => {
            typeAssert.unsafe.castObjectAs(val, path);
            typeAssert.string(val.foo, path.concat('foo'));
            typeAssert.number(val.bar, path.concat('bar'));
            assertBaz(val.baz, path.concat('baz'));
        };

        const testCases = [
            { thing: {}, throws: true, throwsPartial: false },
            { thing: { foo: 'foo' }, throws: true, throwsPartial: false },
            { thing: { foo: 10 }, throws: true, throwsPartial: true },
            { thing: { bar: 10 }, throws: true, throwsPartial: false },
            { thing: { bar: '10' }, throws: true, throwsPartial: false },
            { thing: { foo: 'foo', bar: 10 }, throws: true, throwsPartial: false },
            { thing: { foo: 10, bar: '10' }, throws: true, throwsPartial: true },
            { thing: { foo: 'foo', bar: 10, baz: { nested: 'nested' } }, throws: false, throwsPartial: false },
            { thing: { foo: 'foo', bar: 10, baz: { nested: 10 } }, throws: true, throwsPartial: true },
            { thing: { foo: 'foo', bar: 10, baz: {} }, throws: true, throwsPartial: false },
        ];

        testCases.forEach((testCase) => {
            it(`${testCase.throws ? 'throws' : 'does not throw'} for ${JSON.stringify(testCase.thing)}`, function () {
                const test = () => assertThing(testCase.thing, ['thing']);
                if (testCase.throws) {
                    assert.throws(test);
                } else {
                    assert.doesNotThrow(test);
                }
            });

            it(`partial ${testCase.throwsPartial ? 'throws' : 'does not throw'} for ${JSON.stringify(
                testCase.thing
            )}`, function () {
                const test = () => typeAssert.makePartial(assertThing)(testCase.thing, ['thing']);
                if (testCase.throwsPartial) {
                    assert.throws(test);
                } else {
                    assert.doesNotThrow(test);
                }
            });
        });
    });

    describe('makeTest', function () {
        it('works', function () {
            const isNumber = typeAssert.toTest(typeAssert.number);
            assert(isNumber(10));
            assert(!isNumber('foo'));
        });
    });

    describe('nested assertion', function () {
        it('collects labels', function () {
            const testAssert = (val, label) => {
                typeAssert.object(val, label);
                Object.entries(val).forEach(([key, val]) => typeAssert.string(val, label.concat(key)));
            };

            const object = { foo: 'bar', baz: false };
            assert.throws(() => testAssert(object, ['object']), new TypeError('`object.baz` must be of type "string"'));
        });

        it('works for instanceOf', function () {
            assert.throws(
                () => typeAssert.instanceOf('Error', Error)(null, ['value']),
                new UndefinedError('`value` must be defined')
            );
            assert.throws(
                () => typeAssert.instanceOf('Error', Error)(false, ['value']),
                new TypeError('`value` must be an instance of "Error"')
            );
        });

        it('works for arrayOf', function () {
            assert.throws(
                () => typeAssert.arrayOf(typeAssert.number)([0, 1, '2'], ['arr']),
                new TypeError('`arr.[2]` must be of type "number"')
            );
        });
    });
});
