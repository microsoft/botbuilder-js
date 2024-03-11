// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

const assert = require('assert');
const { stringify } = require('../');

describe('stringify', function () {
    function toJSON(_) {
        return { ...this, _id: `${this._id ?? ''}:toJSON` };
    }

    function replacer(_, val) {
        if (val === null || val === undefined || typeof val !== 'object' || Array.isArray(val)) {
            return val;
        }

        return { ...val, _id: `${val._id ?? ''}:replacer` };
    }

    function _replacer(_) {
        return { ...this, _id: `${this._id ?? ''}:_replacer` };
    }

    describe('normal', function () {
        let value;

        beforeEach(function () {
            value = {
                item: { name: 'item', value: 'testing' },
            };
        });

        it('works with empty value', function () {
            const [
                withNull,
                withUndefined,
                withEmptyObject,
                withEmptyArray,
                withEmptyString,
                withZeroString,
                withOneString,
                withZeroNumber,
                withOneNumber,
            ] = [
                stringify(null),
                stringify(undefined),
                stringify({}),
                stringify([]),
                stringify(''),
                stringify('0'),
                stringify('1'),
                stringify(0),
                stringify(1),
            ];

            assert.strictEqual(withNull, '');
            assert.strictEqual(withUndefined, '');
            assert.strictEqual(withEmptyObject, '{}');
            assert.strictEqual(withEmptyArray, '[]');
            assert.strictEqual(withEmptyString, '');
            assert.strictEqual(withZeroString, '"0"');
            assert.strictEqual(withOneString, '"1"');
            assert.strictEqual(withZeroNumber, '');
            assert.strictEqual(withOneNumber, '1');
        });

        it('works with value', function () {
            const withValue = stringify(value);

            assert.strictEqual(withValue, JSON.stringify(value));
        });

        it('works with replacer', function () {
            const withReplacer = stringify(value, replacer);

            assert.ok(withReplacer.includes('"_id":":replacer"'));
            assert.strictEqual(withReplacer, JSON.stringify(value, replacer));
        });

        it('works with toJSON', function () {
            value.toJSON = toJSON;
            value.item.toJSON = toJSON;
            const withReplacer = stringify(value, replacer);
            const withoutReplacer = stringify(value);

            assert.ok(withReplacer.includes('"_id":":toJSON:replacer"'));
            assert.strictEqual(withReplacer, JSON.stringify(value, replacer));

            assert.ok(withoutReplacer.includes('"_id":":toJSON"'));
            assert.strictEqual(withoutReplacer, JSON.stringify(value));

            assert.notStrictEqual(withReplacer, withoutReplacer);
        });

        it('works with _replacer', function () {
            value.toJSON = toJSON;
            value._replacer = _replacer;
            const withReplacerToJSON = stringify(value, replacer);
            const withoutReplacerToJSON = stringify(value);

            const assertWithReplacerToJSON = JSON.stringify(
                _replacer.call(JSON.parse(JSON.stringify(value, replacer)))
            );
            assert.ok(withReplacerToJSON.includes('"_id":":toJSON:replacer:_replacer"'));
            assert.strictEqual(withReplacerToJSON, assertWithReplacerToJSON);

            const assertWithoutReplacerToJSON = JSON.stringify(_replacer.call(JSON.parse(JSON.stringify(value))));
            assert.ok(withoutReplacerToJSON.includes('"_id":":toJSON:_replacer"'));
            assert.strictEqual(withoutReplacerToJSON, assertWithoutReplacerToJSON);

            assert.notStrictEqual(withReplacerToJSON, withoutReplacerToJSON);
        });

        it('works with space', function () {
            const withValue = stringify(value, null, 2);

            assert.strictEqual(withValue, JSON.stringify(value, null, 2));
        });
    });

    describe('circular structure', function () {
        let value;

        beforeEach(function () {
            const result = { item: { name: 'parent', parent: null, children: [] } };
            result.item.children.push({ parent: result.item, name: 'child1' });
            result.item.children.push({ parent: result.item, name: 'child2' });
            value = result;
        });

        it('works with empty value', function () {
            const [
                withNull,
                withUndefined,
                withEmptyObject,
                withEmptyArray,
                withEmptyString,
                withZeroString,
                withOneString,
                withZeroNumber,
                withOneNumber,
            ] = [
                stringify(null),
                stringify(undefined),
                stringify({}),
                stringify([]),
                stringify(''),
                stringify('0'),
                stringify('1'),
                stringify(0),
                stringify(1),
            ];

            assert.strictEqual(withNull, '');
            assert.strictEqual(withUndefined, '');
            assert.strictEqual(withEmptyObject, '{}');
            assert.strictEqual(withEmptyArray, '[]');
            assert.strictEqual(withEmptyString, '');
            assert.strictEqual(withZeroString, '"0"');
            assert.strictEqual(withOneString, '"1"');
            assert.strictEqual(withZeroNumber, '');
            assert.strictEqual(withOneNumber, '1');
        });

        it('works with value', function () {
            const withValue = stringify(value);

            assert.ok(withValue.includes('[Circular *.item]'));
        });

        it('works with replacer', function () {
            const withReplacer = stringify(value, replacer);

            assert.ok(withReplacer.includes('"_id":":replacer"'));
            assert.ok(withReplacer.includes('[Circular *.item]'));
        });

        it('works with toJSON', function () {
            value.toJSON = toJSON;
            value.item.toJSON = toJSON;
            const withReplacer = stringify(value, replacer);
            const withoutReplacer = stringify(value);

            assert.ok(withReplacer.includes('"_id":":toJSON:replacer"'));
            assert.ok(withReplacer.includes('[Circular *.children]'));

            assert.ok(withoutReplacer.includes('"_id":":toJSON"'));
            assert.ok(withoutReplacer.includes('[Circular *.item.children]'));

            assert.notStrictEqual(withReplacer, withoutReplacer);
        });

        it('works with _replacer', function () {
            value.toJSON = toJSON;
            value._replacer = _replacer;
            const withReplacerToJSON = stringify(value, replacer);
            const withoutReplacerToJSON = stringify(value);

            assert.ok(withReplacerToJSON.includes('"_id":":toJSON:replacer:_replacer"'));
            assert.ok(withReplacerToJSON.includes('[Circular *.item]'));

            assert.ok(withoutReplacerToJSON.includes('"_id":":toJSON:_replacer"'));
            assert.ok(withoutReplacerToJSON.includes('[Circular *.item]'));

            assert.notStrictEqual(withReplacerToJSON, withoutReplacerToJSON);
        });

        it('works with space', function () {
            const withValue = stringify(value, null, 2);

            assert.ok(withValue.includes('[Circular *.item]'));
            assert.ok(withValue.includes('\n  ')); // validate space
        });
    });
});
