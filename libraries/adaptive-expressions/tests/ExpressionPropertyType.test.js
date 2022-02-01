const { ArrayExpression, BoolExpression, IntExpression, NumberExpression, StringExpression } = require('../lib');
const assert = require('assert');

describe('expressionProperty type exception tests', function () {
    it('array expression with error type', function () {
        const errorMsg = 'ArrayExpression accepts string, array or Expression as the value.';
        assert.throws(() => new ArrayExpression(1), Error(errorMsg));
        assert.throws(() => new ArrayExpression(false), Error(errorMsg));
        assert.throws(() => new ArrayExpression({ key: 'value' }), Error(errorMsg));
    });

    it('bool expression with error type', function () {
        const errorMsg = 'BoolExpression accepts string, boolean or Expression as the value.';
        assert.throws(() => new BoolExpression(1), Error(errorMsg));
        assert.throws(() => new BoolExpression(['v1', 'v2']), Error(errorMsg));
        assert.throws(() => new BoolExpression({ key: 'value' }), Error(errorMsg));
    });

    it('int expression with error type', function () {
        const errorMsg = 'IntExpression accepts string, number or Expression as the value.';
        assert.throws(() => new IntExpression(['v1', 'v2']), Error(errorMsg));
        assert.throws(() => new IntExpression(false), Error(errorMsg));
        assert.throws(() => new IntExpression({ key: 'value' }), Error(errorMsg));
    });

    it('number expression with error type', function () {
        const errorMsg = 'NumberExpression accepts string, number or Expression as the value.';
        assert.throws(() => new NumberExpression(['v1', 'v2']), Error(errorMsg));
        assert.throws(() => new NumberExpression(false), Error(errorMsg));
        assert.throws(() => new NumberExpression({ key: 'value' }), Error(errorMsg));
    });

    it('string expression with error type', function () {
        const errorMsg = 'StringExpression accepts string or Expression as the value.';
        assert.throws(() => new StringExpression(['v1', 'v2']), Error(errorMsg));
        assert.throws(() => new StringExpression(false), Error(errorMsg));
        assert.throws(() => new StringExpression(1), Error(errorMsg));
        assert.throws(() => new StringExpression({ key: 'value' }), Error(errorMsg));
    });
});
