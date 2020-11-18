// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { assertExt } = require('../');
const { UndefinedError, assert: typeAssert, tests } = require('../lib/types');

describe('assertType', () => {
    const testCases = [
        { label: 'any', assert: typeAssert.any, input: 0, throws: false },
        { label: 'any', assert: typeAssert.unknown, input: 0, throws: false },

        { label: 'unknown', assert: typeAssert.unknown, input: 0, throws: false },

        { label: 'array', assert: typeAssert.array, input: [], throws: false },
        { label: 'array', assert: typeAssert.array, input: {}, throws: true },
        { label: 'array', assert: typeAssert.array, input: false, throws: true },

        { label: 'boolean', assert: typeAssert.boolean, input: true, throws: false },
        { label: 'boolean', assert: typeAssert.boolean, input: false, throws: false },
        { label: 'boolean', assert: typeAssert.boolean, input: 10, throws: true },

        { label: 'date', assert: typeAssert.date, input: new Date(), throws: false },
        { label: 'date', assert: typeAssert.date, input: {}, throws: true },

        { label: 'dictionary', assert: typeAssert.dictionary, input: {}, throws: false },
        { label: 'dictionary', assert: typeAssert.dictionary, input: [], throws: true },

        { label: 'object', assert: typeAssert.object, input: {}, throws: false },
        { label: 'object', assert: typeAssert.object, input: [], throws: true },

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

        { label: 'nil', assert: typeAssert.nil, input: null, throws: false },
        { label: 'nil', assert: typeAssert.nil, input: undefined, throws: false },
        { label: 'nil', assert: typeAssert.nil, input: false, throws: true },

        { label: 'number', assert: typeAssert.number, input: 10, throws: false },
        { label: 'number', assert: typeAssert.number, input: false, throws: true },

        { label: 'string', assert: typeAssert.string, input: 'hello', throws: false },
        { label: 'string', assert: typeAssert.string, input: '', throws: false },
        { label: 'string', assert: typeAssert.string, input: false, throws: true },
    ];

    testCases.forEach((testCase) => {
        it(`typeAssert.${testCase.label} with ${JSON.stringify(testCase.input)} ${
            testCase.throws ? 'throws' : 'does not throw'
        }`, () => {
            const test = () => testCase.assert(testCase.input, [testCase.label]);

            if (testCase.throws) {
                assert.throws(test);
            } else {
                assert.doesNotThrow(test);
            }
        });
    });

    describe('maybe', () => {
        it('works', () => {
            assert.doesNotThrow(() => typeAssert.maybeString('foo', []));
            assert.doesNotThrow(() => typeAssert.maybeString(undefined, []));
            assert.doesNotThrow(() => typeAssert.maybeString(null, []));
            assert.throws(() => typeAssert.maybeString(true, []));
        });

        it('works for arrayOf', () => {
            assert.doesNotThrow(() => typeAssert.maybeArrayOf(typeAssert.number)([1, 2, 3], []));
            assert.doesNotThrow(() => typeAssert.maybeArrayOf(typeAssert.number)(undefined, []));
            assertExt.throwsMessage(
                () => typeAssert.maybeArrayOf(typeAssert.number)([1, 2, '3'], ['arr']),
                '`arr.[2]` must be of type "number"'
            );
        });

        it('works for instanceOf', () => {
            assert.doesNotThrow(() => typeAssert.maybeInstanceOf('Error', Error)(new Error(), []));
            assert.doesNotThrow(() => typeAssert.maybeInstanceOf('Error', Error)(undefined, []));
            assertExt.throwsMessage(
                () => typeAssert.maybeInstanceOf('Error', Error)('foo', ['err']),
                '`err` must be an instance of "Error"'
            );
        });

        it('works for oneOf', () => {
            assert.doesNotThrow(() => typeAssert.maybeOneOf(tests.isNumber, tests.isString)(10, []));
            assert.doesNotThrow(() => typeAssert.maybeOneOf(tests.isNumber, tests.isString)('11', []));
            assertExt.throwsMessage(
                () => typeAssert.maybeOneOf(tests.isNumber, tests.isString)(false, ['val']),
                '`val` is of wrong type'
            );
        });
    });

    describe('partial', () => {
        const assertThing = (val, path) => {
            typeAssert.unsafe.castObjectAs(val, path);
            typeAssert.string(val.foo, path.concat('foo'));
            typeAssert.number(val.bar, path.concat('bar'));
        };

        const testCases = [
            { thing: {}, throws: true, throwsPartial: false },
            { thing: { foo: 'foo' }, throws: true, throwsPartial: false },
            { thing: { foo: 10 }, throws: true, throwsPartial: true },
            { thing: { bar: 10 }, throws: true, throwsPartial: false },
            { thing: { bar: '10' }, throws: true, throwsPartial: false },
            { thing: { foo: 'foo', bar: 10 }, throws: false, throwsPartial: false },
            { thing: { foo: 10, bar: '10' }, throws: true, throwsPartial: true },
        ];

        testCases.forEach((testCase) => {
            it(`${testCase.throws ? 'throws' : 'does not throw'} for ${JSON.stringify(testCase.thing)}`, () => {
                const test = () => assertThing(testCase.thing, ['thing']);
                if (testCase.throws) {
                    assert.throws(test);
                } else {
                    assert.doesNotThrow(test);
                }
            });

            it(`partial ${testCase.throwsPartial ? 'throws' : 'does not throw'} for ${JSON.stringify(
                testCase.thing
            )}`, () => {
                const test = () => typeAssert.makePartial(assertThing)(testCase.thing, ['thing']);
                if (testCase.throwsPartial) {
                    assert.throws(test);
                } else {
                    assert.doesNotThrow(test);
                }
            });
        });
    });

    describe('makeTest', () => {
        it('works', () => {
            const isNumber = typeAssert.toTest(typeAssert.number);
            assert(isNumber(10));
            assert(!isNumber('foo'));
        });
    });

    describe('nested assertion', () => {
        it('collects labels', () => {
            const testAssert = (val, label) => {
                typeAssert.object(val, label);
                Object.entries(val).forEach(([key, val]) => typeAssert.string(val, label.concat(key)));
            };

            const object = { foo: 'bar', baz: false };
            assertExt.throwsMessage(() => testAssert(object, ['object']), '`object.baz` must be of type "string"');
        });

        it('works for instanceOf', () => {
            assertExt.throwsMessage(
                () => typeAssert.instanceOf('Error', Error)(null, ['value']),
                '`value` must be defined'
            );
            assertExt.throwsMessage(
                () => typeAssert.instanceOf('Error', Error)(false, ['value']),
                '`value` must be an instance of "Error"'
            );
        });

        it('works for arrayOf', () => {
            assertExt.throwsMessage(
                () => typeAssert.arrayOf(typeAssert.number)([0, 1, '2'], ['arr']),
                '`arr.[2]` must be of type "number"'
            );
        });
    });
});
