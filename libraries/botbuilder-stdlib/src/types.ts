// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { assertCondition } from './assertExt';

// Newable describes the constructor of a type T
export type Newable<T> = new (...args: unknown[]) => T;

// A dictionary type describes a common Javascript object
export type Dictionary<V, K extends string | number = string | number> = Record<K, V>;

// A type test function signature
export type Test<T> = (val: unknown) => val is T;

// A type assertion method signature
export type Assertion<T> = (val: unknown, path: string[]) => asserts val is T;

// Formats error messages for assertion failures
const formatPathAndTypeName = (typeName: string, path: string[]): string =>
    `\`${path.join('.')}\` must be of type "${typeName}"`;

// Constructs a type assertion given a type name and a function that tests if a value is a particular type
const makeAssertion = <T>(typeName: string, test: Test<T>): Assertion<T> => (val, path) => {
    assertCondition(test(val), formatPathAndTypeName(typeName, path));
};

// Constructs a type assertion that is enforced if the value is not null or undefined
const makeMaybeAssertion = <T>(assertion: Assertion<T>): Assertion<T | Nil> => (val, path) => {
    if (!isNil(val)) {
        assertion(val, path);
    }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isAny: Test<any> = (val): val is any => true;
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
const maybeError = makeMaybeAssertion(error);

export type Func = (...args: unknown[]) => unknown;
const isFunc: Test<Func> = (val): val is Func => typeof val === 'function';
const func = makeAssertion('Function', isFunc);
const maybeFunc = makeMaybeAssertion(func);

export type Nil = null | undefined;
const isNil: Test<Nil> = (val: unknown): val is Nil => val == null;
const nil = makeAssertion('nil', isNil);

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

// Makes a type test out of an assertion
const makeTest = <T>(assert: Assertion<T>): Test<T> => (val): val is T => {
    try {
        assert(val, []);
        return true;
    } catch (err) {
        return false;
    }
};

export const tests = {
    isAny,
    isArray,
    isBoolean,
    isDate,
    isDictionary,
    isError,
    isFunc,
    isNil,
    isNumber,
    isObject,
    isString,
    isUnknown,

    fromAssertion: makeTest,
    toAssertion: makeAssertion,
};

const arrayOf = <T>(asserts: Assertion<T>): Assertion<Array<T>> => (val, path) => {
    const assertArray: Assertion<unknown[]> = array;
    assertArray(val, path);
    val.forEach((val, idx) => asserts(val, path.concat(`[${idx}]`)));
};

const arrayOfString: Assertion<Array<string>> = arrayOf(string);
const maybeArrayOfString: Assertion<Array<string> | Nil> = makeMaybeAssertion(arrayOfString);

const maybeArrayOf = <T>(asserts: Assertion<T>): Assertion<Array<T> | Nil> => (val, path) => {
    const assertArrayOf: Assertion<Array<T>> = arrayOf(asserts);
    const assertMaybeArrayOf: Assertion<Array<T> | Nil> = makeMaybeAssertion(assertArrayOf);
    assertMaybeArrayOf(val, path);
};

const instanceOf = <T>(typeName: string, ctor: Newable<T>): Assertion<T> => (val, path) => {
    assertCondition(val instanceof ctor, formatPathAndTypeName(typeName, path));
};

const maybeInstanceOf = <T>(typeName: string, ctor: Newable<T>): Assertion<T | Nil> => (val, path) => {
    const assertInstanceOf: Assertion<T> = instanceOf(typeName, ctor);
    const assertMaybeInstanceOf: Assertion<T | Nil> = makeMaybeAssertion(assertInstanceOf);
    assertMaybeInstanceOf(val, path);
};

// Note: this assertion does not actually assert that `val` is of type `T`. It is useful as the first
// line in a nested assertion so that remaining assertion calls can leverage helpful intellisense. This
// method is only exported under the `unsafe` keyword as a constant reminder of this fact.
const objectAs = <T>(val: unknown, path: string[]): asserts val is T => {
    assertCondition(isObject(val), formatPathAndTypeName('object', path));
};

export const assert = {
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
    maybeError,

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
    maybeArrayOfString,

    instanceOf,
    maybeInstanceOf,

    // Some helpful, well, helpers
    fromTest: makeAssertion,
    makeMaybe: makeMaybeAssertion,
    toTest: makeTest,

    unsafe: { objectAs },
};
