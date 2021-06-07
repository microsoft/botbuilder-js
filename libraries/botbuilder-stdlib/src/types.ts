// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { NewableError, assertCondition } from './assertExt';

// Nil describes a null or undefined value;
export type Nil = null | undefined;

// Maybe describes a type that is `T`, or `Nil`
export type Maybe<T> = T | Nil;

// Newable ensures that a given value is a constructor
export type Newable<T, A extends unknown[] = unknown[]> = new (...args: A) => T;

// Extends<T> mimics Newable<T>, but works for abstract classes as well
export type Extends<T> = Function & { prototype: T }; // eslint-disable-line @typescript-eslint/ban-types

// A dictionary type describes a common Javascript object
export type Dictionary<V = unknown, K extends string | number = string | number> = Record<K, V>;

// A type test function signature
export type Test<T> = (val: unknown) => val is T;

// A type assertion method signature
export type Assertion<T> = (val: unknown, path: string[]) => asserts val is T;

// Formats error messages for assertion failures
const formatPathAndMessage = (path: string[], message: string): string => `\`${path.join('.')}\` ${message}`;

/**
 * An error that indicates that the source of the error was an undefined value
 */
export class UndefinedError extends Error {}

/**
 * Asserts `cond` to the typescript compiler
 *
 * @param {any} cond a condition to assert
 * @param {string[]} path the accumulated path for the assertion
 * @param {string} message an error message to use
 * @param {NewableError} errorCtor an optional error constructor
 */
function condition(cond: unknown, path: string[], message: string, errorCtor: NewableError = TypeError): asserts cond {
    assertCondition(cond, formatPathAndMessage(path, message), errorCtor);
}

/**
 * Construct an assertion function
 *
 * @template T the type to assert
 * @param {string} typeName the name of type `T`
 * @param {Test<T>} test a method to test if an unknown value is of type `T`
 * @param {boolean} acceptNil true if null or undefined values are acceptable
 * @returns {Assertion<T>} an assertion that asserts an unknown value is of type `T`
 */
function makeAssertion<T>(typeName: string, test: Test<T>, acceptNil = false): Assertion<T> {
    return (val, path) => {
        if (!acceptNil) {
            condition(!isNil(val), path, 'must be defined', UndefinedError);
        }
        condition(test(val), path, `must be of type "${typeName}"`);
    };
}

/**
 * Constructs a type assertion that is enforced if the value is not null or undefined
 *
 * @template T the type to assert
 * @param {Assertion<T>} assertion the assertion
 * @returns {Assertion<Maybe<T>>} an assertion that asserts an unknown value is of type `T` or `Nil`
 */
function makeMaybeAssertion<T>(assertion: Assertion<T>): Assertion<Maybe<T>> {
    return (val, path) => {
        if (!isNil(val)) {
            assertion(val, path);
        }
    };
}

/**
 * Takes an assertion for type `T` and returns an assertion for type `Partial<T>`. The implementation
 * expects that the assertion throws `UndefinedError` if an expected value is undefined. All the assertions
 * exported by this package satisfy that requirement.
 *
 * @template T a type extending from `Dictionary`
 * @param {Assertion<T>} assertion an assertion that asserts an unknown value is of type `T`
 * @returns {Assertion<Partial<T>>} an assertion that asserts an unknown value is of type `Partial<T>`
 */
function makePartialAssertion<T extends Dictionary>(assertion: Assertion<T>): Assertion<Partial<T>> {
    return (val, path) => {
        try {
            assertion(val, path);
        } catch (err) {
            if (!isUndefinedError(err)) {
                throw err;
            }
        }
    };
}

/**
 * Test if `val` is of type `any`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `any`
 */
function isAny(val: unknown): val is any {
    return true;
}

/**
 * Assert that `val` is of type `any`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function any(val: unknown, path: string[]): asserts val is any {
    const assertion: Assertion<any> = makeAssertion('any', isAny);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `any`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeAny(val: unknown, path: string[]): asserts val is Maybe<any> {
    const assertion: Assertion<Maybe<any>> = makeMaybeAssertion(any);
    assertion(val, path);
}

/**
 * Test if `val` is of type `array`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `array`
 */
function isArray(val: unknown): val is unknown[] {
    return Array.isArray(val);
}

/**
 * Assert that `val` is of type `array`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function array(val: unknown, path: string[]): asserts val is unknown[] {
    const assertion: Assertion<unknown[]> = makeAssertion('array', isArray);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `array`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeArray(val: unknown, path: string[]): asserts val is Maybe<unknown[]> {
    const assertion: Assertion<Maybe<unknown[]>> = makeMaybeAssertion(array);
    assertion(val, path);
}

/**
 * Test if `val` is of type `boolean`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `boolean`
 */
function isBoolean(val: unknown): val is boolean {
    return typeof val === 'boolean';
}

/**
 * Assert that `val` is of type `boolean`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function boolean(val: unknown, path: string[]): asserts val is boolean {
    const assertion: Assertion<boolean> = makeAssertion('boolean', isBoolean);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `boolean`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeBoolean(val: unknown, path: string[]): asserts val is Maybe<boolean> {
    const assertion: Assertion<Maybe<boolean>> = makeMaybeAssertion(boolean);
    assertion(val, path);
}

/**
 * Test if `val` is of type `Date`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `Date`
 */
function isDate(val: unknown): val is Date {
    return val instanceof Date;
}

/**
 * Assert that `val` is of type `Date`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function date(val: unknown, path: string[]): asserts val is Date {
    const assertion: Assertion<Date> = makeAssertion('Date', isDate);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `Date`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeDate(val: unknown, path: string[]): asserts val is Maybe<Date> {
    const assertion: Assertion<Maybe<Date>> = makeMaybeAssertion(date);
    assertion(val, path);
}

/**
 * Test if `val` is of type `Dictionary`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `Dictionary`
 */
function isDictionary(val: unknown): val is Dictionary {
    return isObject(val);
}

/**
 * Assert that `val` is of type `Dictionary`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function dictionary(val: unknown, path: string[]): asserts val is Dictionary {
    const assertion: Assertion<Dictionary> = makeAssertion('Dictionary', isDictionary);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `Dictionary`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeDictionary(val: unknown, path: string[]): asserts val is Maybe<Dictionary> {
    const assertion: Assertion<Maybe<Dictionary>> = makeMaybeAssertion(dictionary);
    assertion(val, path);
}

/**
 * Test if `val` is of type `Error`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `Error`
 */
function isError(val: unknown): val is Error {
    return val instanceof Error;
}

/**
 * Assert that `val` is of type `Error`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function error(val: unknown, path: string[]): asserts val is Error {
    const assertion: Assertion<Error> = makeAssertion('Error', isError);
    assertion(val, path);
}

/**
 * Test if `val` is of type `TypeError`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `TypeError`
 */
function isTypeError(val: unknown): val is TypeError {
    return val instanceof TypeError;
}

/**
 * Assert that `val` is of type `TypeError`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function typeError(val: unknown, path: string[]): asserts val is TypeError {
    const assertion: Assertion<TypeError> = makeAssertion('TypeError', isTypeError);
    assertion(val, path);
}

/**
 * Test if `val` is of type `UndefinedError`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `UndefinedError`
 */
function isUndefinedError(val: unknown): val is UndefinedError {
    return val instanceof UndefinedError;
}

/**
 * Assert that `val` is of type `UndefinedError`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function undefinedError(val: unknown, path: string[]): asserts val is UndefinedError {
    const assertion: Assertion<UndefinedError> = makeAssertion('UndefinedError', isUndefinedError);
    assertion(val, path);
}

// Represents a generic function
export type Func<T extends unknown[] = unknown[], R = unknown> = (...args: T) => R;

/**
 * Test if `val` is of type `Func`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `Func`
 */
function isFunc(val: unknown): val is Func {
    return typeof val === 'function';
}

/**
 * Assert that `val` is of type `Func`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function func(val: unknown, path: string[]): asserts val is Func {
    const assertion: Assertion<Func> = makeAssertion('Function', isFunc);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `Func`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeFunc(val: unknown, path: string[]): asserts val is Maybe<Func> {
    const assertion: Assertion<Maybe<Func>> = makeMaybeAssertion(func);
    assertion(val, path);
}

/**
 * Test if `val` is of type `Nil`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `Func`
 */
function isNil(val: unknown): val is Nil {
    return val == null;
}

/**
 * Assert that `val` is of type `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function nil(val: unknown, path: string[]): asserts val is Nil {
    const assertion: Assertion<Nil> = makeAssertion('nil', isNil, true);
    assertion(val, path);
}

/**
 * Test if `val` is of type `string`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `string`
 */
function isString(val: unknown): val is string {
    return typeof val === 'string';
}

/**
 * Test if `val` is of type `string` with zero length or `Nil`.
 *
 * @remarks
 * Implementation of string.IsNullOrEmpty(): https://docs.microsoft.com/en-us/dotnet/api/system.string.isnullorempty?view=netcore-3.1
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of `string` with zero length or `Nil`
 */
function isStringNullOrEmpty(val: unknown): val is Maybe<string> {
    return tests.isNil(val) || (tests.isString(val) && !val.length);
}

/**
 * Assert that `val` is of type `string`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function string(val: unknown, path: string[]): asserts val is string {
    const assertion: Assertion<string> = makeAssertion('string', isString);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `string`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeString(val: unknown, path: string[]): asserts val is Maybe<string> {
    const assertion: Assertion<Maybe<string>> = makeMaybeAssertion(string);
    assertion(val, path);
}

/**
 * Test if `val` is of type `number`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `number`
 */
function isNumber(val: unknown): val is number {
    return typeof val === 'number' && !isNaN(val);
}

/**
 * Assert that `val` is of type `number`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function number(val: unknown, path: string[]): asserts val is number {
    const assertion: Assertion<number> = makeAssertion('number', isNumber);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `number`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeNumber(val: unknown, path: string[]): asserts val is Maybe<number> {
    const assertion: Assertion<Maybe<number>> = makeMaybeAssertion(number);
    assertion(val, path);
}

/**
 * Test if `val` is of type `object`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `object`
 */
function isObject(val: unknown): val is object {
    return !isNil(val) && typeof val === 'object' && !isArray(val);
}

/**
 * Assert that `val` is of type `object`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function object(val: unknown, path: string[]): asserts val is object {
    const assertion: Assertion<object> = makeAssertion('object', isObject);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `object`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeObject(val: unknown, path: string[]): asserts val is Maybe<object> {
    const assertion: Assertion<Maybe<object>> = makeMaybeAssertion(object);
    assertion(val, path);
}

/**
 * Test if `val` is of type `unknown`.
 *
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `unknown`
 */
function isUnknown(val: unknown): val is unknown {
    return true;
}

/**
 * Assert that `val` is of type `unknown`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function unknown(val: unknown, path: string[]): asserts val is unknown {
    const assertion: Assertion<unknown> = makeAssertion('unknown', isUnknown);
    assertion(val, path);
}

/**
 * Assert that `val` is of type `unknown`, or `Nil`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function maybeUnknown(val: unknown, path: string[]): asserts val is Maybe<unknown> {
    const assertion: Assertion<Maybe<unknown>> = makeMaybeAssertion(unknown);
    assertion(val, path);
}

/**
 * Make a type test function out of an assertion
 *
 * @template T the type to test
 * @param {Assertion<T>} assertion an assertion
 * @returns {Test<T>} a type test that returns true if an unknown value is of type `T`
 */
function makeTest<T>(assertion: Assertion<T>): Test<T> {
    return (val): val is T => {
        try {
            assertion(val, []);
            return true;
        } catch (_err) {
            return false;
        }
    };
}

/**
 * **UNSAFE**
 * Test if `val` is of type `object`.
 * This test does not actually verify that `val` is of type `T`. It is useful as the first
 * line in a nested assertion so that remaining assertion calls can leverage helpful intellisense.
 * This method is only exported under the `unsafe` keyword as a constant reminder of this fact.
 *
 * @template T the type to cast `val` to, should extend `Dictionary<unknown>`, i.e. be itself an object
 * @param {any} val value to test
 * @returns {boolean} true if `val` is of type `object`
 */
function isObjectAs<T>(val: unknown): val is T {
    castObjectAs<T>(val, []);
    return isObject(val);
}

export const tests = {
    isAny,
    isArray,
    isBoolean,
    isDate,
    isDictionary,
    isFunc,
    isNil,
    isNumber,
    isObject,
    isString,
    isStringNullOrEmpty,
    isUnknown,

    isError,
    isTypeError,
    isUndefinedError,

    fromAssertion: makeTest,
    toAssertion: makeAssertion,

    unsafe: { isObjectAs },
};

/**
 * Construct an assertion that an unknown value is an array with items of type `T`
 *
 * @template T the item type
 * @param {Assertion<T>} assertion the assertion
 * @returns {Assertion<Array<T>>} an assertion that asserts an unknown value is an array with items of type `T`
 */
function arrayOf<T>(assertion: Assertion<T>): Assertion<Array<T>> {
    return (val, path) => {
        const assertArray: Assertion<unknown[]> = array;
        assertArray(val, path);

        val.forEach((val, idx) => assertion(val, path.concat(`[${idx}]`)));
    };
}

/**
 * Assert that `val` is of type `string[]`.
 *
 * @param {any} val value to assert
 * @param {string[]} path path to val (useful for nested assertions)
 */
function arrayOfString(val: unknown, path: string[]): asserts val is string[] {
    const assertion: Assertion<string[]> = arrayOf(string);
    assertion(val, path);
}

/**
 * Construct an assertion that an unknown value is an array with items of type `T`, or `Nil`
 *
 * @template T the item type
 * @param {Assertion<T>} assertion the assertion
 * @returns {Assertion<Maybe<Array<T>>>} an assertion that asserts an unknown value is an array with
 * items of type `T`, or `Nil`
 */
function maybeArrayOf<T>(assertion: Assertion<T>): Assertion<Maybe<Array<T>>> {
    return (val, path) => {
        const assertArrayOf: Assertion<Array<T>> = arrayOf(assertion);
        const assertMaybeArrayOf: Assertion<Array<T> | Nil> = makeMaybeAssertion(assertArrayOf);
        assertMaybeArrayOf(val, path);
    };
}

/**
 * Construct an assertion that an unknown value is an instance of type `T`
 *
 * @template T the instance type
 * @param {string} typeName the name of type `T`
 * @param {Newable<T> | Extends<T>} ctor a constructor reference for type `T`
 * @returns {Assertion<T>} an assertion that asserts an unknown value is an instance of type `T`
 */
function instanceOf<T>(typeName: string, ctor: Newable<T> | Extends<T>): Assertion<T> {
    return (val, path) => {
        condition(!isNil(val), path, 'must be defined', UndefinedError);
        condition(val instanceof ctor, path, `must be an instance of "${typeName}"`);
    };
}

/**
 * Construct an assertion that an unknown value is an instance of type `T`, or `Nil`
 *
 * @template T the instance type
 * @param {string} typeName the name of type `T`
 * @param {Newable<T> | Extends<T>} ctor a constructor reference for type `T`
 * @returns {Assertion<Maybe<T>>} an assertion that asserts an unknown value is an instance of type `T`, or `Nil`
 */
function maybeInstanceOf<T>(typeName: string, ctor: Newable<T> | Extends<T>): Assertion<Maybe<T>> {
    return (val, path) => {
        const assertInstanceOf: Assertion<T> = instanceOf(typeName, ctor);
        const assertMaybeInstanceOf: Assertion<T | Nil> = makeMaybeAssertion(assertInstanceOf);
        assertMaybeInstanceOf(val, path);
    };
}

/**
 * Construct an assertion that an unknown value is of type `T`, likely a union type
 *
 * @template T the type, likely a union of other types
 * @param {Array<Test<T>>} tests a set of tests for type `T`
 * @returns {Assertion<T>} an assertion that asserts an unknown value is of type `T`
 */
function oneOf<T>(...tests: Array<Test<T>>): Assertion<T> {
    return (val, path) => {
        condition(!isNil(val), path, 'must be defined', UndefinedError);
        if (!tests.some((test) => test(val))) {
            condition(false, path, 'is of wrong type');
        }
    };
}

/**
 * Construct an assertion that an unknown value is of type `T`, likely a union type, or `Nil`
 *
 * @template T the type, likely a union of other types
 * @param {Array<Test<T>>} tests a set of tests for type `T`
 * @returns {Assertion<Maybe<T>>} an assertion that asserts an unknown value is of type `T`, or `Nil`
 */
function maybeOneOf<T>(...tests: Array<Test<T>>): Assertion<Maybe<T>> {
    return (val, path) => {
        const assertOneOf: Assertion<T> = oneOf(...tests);
        const assertMaybeOneOf: Assertion<T | Nil> = makeMaybeAssertion(assertOneOf);
        assertMaybeOneOf(val, path);
    };
}

/**
 * **UNSAFE**
 * This assertion does not actually verify that `val` is of type `T`. It is useful as the first
 * line in a nested assertion so that remaining assertion calls can leverage helpful intellisense.
 * This method is only exported under the `unsafe` keyword as a constant reminder of this fact.
 *
 * @template T the type to cast `val` to, should extend `Dictionary<unknown>`, i.e. be itself an object
 * @param {any} val the unknown value
 * @param {string[]} path the accumulated assertion path
 */
function castObjectAs<T>(val: unknown, path: string[]): asserts val is T {
    const assertWithCast: Assertion<T> = object;
    assertWithCast(val, path);
}

export const assert = {
    condition,

    any,
    maybeAny,

    array,
    maybeArray,

    boolean,
    maybeBoolean,

    date,
    maybeDate,

    dictionary,
    maybeDictionary,

    error,
    undefinedError,
    typeError,

    func,
    maybeFunc,

    nil,

    number,
    maybeNumber,

    object,
    maybeObject,

    string,
    maybeString,

    unknown,
    maybeUnknown,

    arrayOf,
    maybeArrayOf,
    arrayOfString,

    instanceOf,
    maybeInstanceOf,

    oneOf,
    maybeOneOf,

    // Some helpful, well, helpers
    fromTest: makeAssertion,
    makeMaybe: makeMaybeAssertion,
    makePartial: makePartialAssertion,
    toTest: makeTest,

    unsafe: { castObjectAs },
};
