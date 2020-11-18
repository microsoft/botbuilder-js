// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { assertCondition } from './assertExt';

// Nil describes a null or undefined value;
export type Nil = null | undefined;

// Maybe describes a type that is `T`, or `Nil`
export type Maybe<T> = T | Nil;

// Newable ensures that a given value is a constructor
export type Newable<T> = new (...args: unknown[]) => T;

// Extends<T> mimics Newable<T>, but works for abstract classes as well
export type Extends<T> = Function & { prototype: T }; // eslint-disable-line @typescript-eslint/ban-types

// A dictionary type describes a common Javascript object
export type Dictionary<V, K extends string | number = string | number> = Record<K, V>;

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
 * @param {Newable<Error>} errorCtor an optional error constructor
 */
function condition(
    cond: unknown,
    path: string[],
    message: string,
    errorCtor: Newable<Error> = TypeError
): asserts cond {
    assertCondition(cond, formatPathAndMessage(path, message), errorCtor);
}

/**
 * Construct an assertion function
 *
 * @template T the type to assert
 * @param {string} typeName the name of type `T`
 * @param {Test<T>} test a method to test if an unknown value is of type `T`
 * @param {boolean} acceptNil true if undefined values are acceptable
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
function makePartialAssertion<T extends Dictionary<unknown>>(assertion: Assertion<T>): Assertion<Partial<T>> {
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

const isAny: Test<any> = (val): val is any => true; // eslint-disable-line @typescript-eslint/no-explicit-any
const any = makeAssertion('any', isAny);
const maybeAny = makeMaybeAssertion(any);

const isArray: Test<unknown[]> = (val): val is unknown[] => Array.isArray(val);
const array = makeAssertion<unknown[]>('array', isArray);
const maybeArray = makeMaybeAssertion(array);

const isBoolean: Test<boolean> = (val): val is boolean => typeof val === 'boolean';
const boolean = makeAssertion('boolean', isBoolean);
const maybeBoolean = makeMaybeAssertion(boolean);

const isDate: Test<Date> = (val): val is Date => val instanceof Date;
const date = makeAssertion('Date', isDate);
const maybeDate = makeMaybeAssertion(date);

const isDictionary: Test<Dictionary<unknown>> = (val): val is Dictionary<unknown> => isObject(val);
const dictionary = makeAssertion('Dictionary', isDictionary);
const maybeDictionary = makeMaybeAssertion(dictionary);

const isError: Test<Error> = (val): val is Error => val instanceof Error;
const error = makeAssertion('Error', isError);

const isTypeError: Test<TypeError> = (val): val is TypeError => val instanceof TypeError;
const typeError = makeAssertion('TypeError', isTypeError);

const isUndefinedError: Test<UndefinedError> = (val): val is UndefinedError => val instanceof UndefinedError;
const undefinedError = makeAssertion('UndefinedError', isUndefinedError);

export type Func<T = unknown> = (...args: unknown[]) => T;
const isFunc: Test<Func> = (val): val is Func => typeof val === 'function';
const func = makeAssertion('Function', isFunc);
const maybeFunc = makeMaybeAssertion(func);

const isNil: Test<Nil> = (val: unknown): val is Nil => val == null;
const nil = makeAssertion('nil', isNil, true);

const isString: Test<string> = (val): val is string => typeof val === 'string';
const string = makeAssertion('string', isString);
const maybeString = makeMaybeAssertion(string);

const isNumber: Test<number> = (val): val is number => typeof val === 'number' && !isNaN(val);
const number = makeAssertion('number', isNumber);
const maybeNumber = makeMaybeAssertion(number);

// eslint-disable-next-line @typescript-eslint/ban-types
const isObject: Test<object> = (val): val is object => typeof val === 'object' && !isArray(val);
const object = makeAssertion('object', isObject);
const maybeObject = makeMaybeAssertion(object);

const isUnknown: Test<unknown> = (val): val is unknown => true;
const unknown = makeAssertion('unknown', isUnknown);
const maybeUnknown = makeMaybeAssertion(unknown);

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
        } catch (err) {
            return false;
        }
    };
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
    isUnknown,

    isError,
    isTypeError,
    isUndefinedError,

    fromAssertion: makeTest,
    toAssertion: makeAssertion,
};

/**
 * Construct an assertion that an unknown value is an array with items of type `T`
 *
 * @template T the item type
 * @param {Assertion<T>} assertion the assertion
 * @returns {Assertion<Array<T>>} an assertion that asserts an unknown value is an array with
 * items of type `T`
 */
function arrayOf<T>(assertion: Assertion<T>): Assertion<Array<T>> {
    return (val, path) => {
        const assertArray: Assertion<unknown[]> = array;
        assertArray(val, path);

        val.forEach((val, idx) => assertion(val, path.concat(`[${idx}]`)));
    };
}

const arrayOfString: Assertion<Array<string>> = arrayOf(string);

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
