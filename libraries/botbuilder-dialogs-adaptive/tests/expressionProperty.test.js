"use strict";
exports.__esModule = true;
/* eslint-disable @typescript-eslint/explicit-function-return-type */
var assert = require("assert");
var __1 = require("../");
describe('expressionProperty tests', function () {
    it('ArrayExpression string', function () {
        var ArrFoo = /** @class */ (function () {
            function ArrFoo() {
            }
            return ArrFoo;
        }());
        ;
        var test = { strings: ['a', 'b', 'c'] };
        var data = { test: test };
        var val = new __1.ArrayExpression('test.strings');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(result, data.test.strings);
        val = new __1.ArrayExpression('=test.strings');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.strings);
        val = new __1.ArrayExpression(data.test.strings);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.strings);
    });
    it('ArrayExpression object', function () {
        var Foo = /** @class */ (function () {
            function Foo() {
            }
            return Foo;
        }());
        ;
        var ArrFoo = /** @class */ (function () {
            function ArrFoo() {
            }
            return ArrFoo;
        }());
        ;
        var foo = { age: 13, name: 'joe' };
        var test = { objects: [foo] };
        var data = { test: test };
        var val = new __1.ArrayExpression('test.objects');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(result, data.test.objects);
        val = new __1.ArrayExpression('=test.objects');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.objects);
        val = new __1.ArrayExpression(data.test.objects);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.objects);
    });
    it('BoolExpression', function () {
        var data = { test: true };
        var val = new __1.BoolExpression('true');
        assert.equal(val.expressionText, 'true');
        var result = val.getValue(data);
        assert.equal(result, true);
        val = new __1.BoolExpression('=true');
        assert.equal(val.expressionText, 'true');
        result = val.getValue(data);
        assert.equal(result, true);
        val = new __1.BoolExpression(true);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, true);
        result = val.getValue(data);
        assert.equal(result, true);
        val = new __1.BoolExpression('=test');
        assert.equal(val.expressionText, 'test');
        result = val.getValue(data);
        assert.equal(result, true);
        val = new __1.BoolExpression();
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, false);
        result = val.getValue(data);
        assert.equal(result, false);
    });
    it('EnumExpression', function () {
        var TestEnum;
        (function (TestEnum) {
            TestEnum[TestEnum["One"] = 0] = "One";
            TestEnum[TestEnum["Two"] = 1] = "Two";
            TestEnum[TestEnum["Three"] = 2] = "Three";
        })(TestEnum || (TestEnum = {}));
        ;
        var data = { test: TestEnum.Three };
        var val = new __1.EnumExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(result, TestEnum.Three);
        val = new __1.EnumExpression(TestEnum.Three);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, TestEnum.Three);
        result = val.getValue(data);
        assert.equal(result, TestEnum.Three);
    });
    it('IntExpression', function () {
        var data = { test: 13 };
        var val = new __1.IntExpression('test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(result, 13);
        val = new __1.IntExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 13);
        val = new __1.IntExpression('13');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 13);
        val = new __1.IntExpression('=13');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 13);
        val = new __1.IntExpression(13);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, 13);
        result = val.getValue(data);
        assert.equal(result, 13);
    });
    it('NumberExpression', function () {
        var data = { test: 3.14 };
        var val = new __1.NumberExpression('test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new __1.NumberExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new __1.NumberExpression('3.14');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new __1.NumberExpression('=3.14');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new __1.NumberExpression(3.14);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, 3.14);
        result = val.getValue(data);
        assert.equal(result, 3.14);
    });
    it('ObjectExpression', function () {
        var Foo = /** @class */ (function () {
            function Foo() {
            }
            return Foo;
        }());
        ;
        var foo = { age: 13, name: 'joe' };
        var data = { test: foo };
        var val = new __1.ObjectExpression('test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
        val = new __1.ObjectExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
        val = new __1.ObjectExpression(data.test);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
        val = new __1.ObjectExpression(function () { return data.test; });
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
    });
    it('StringExpression', function () {
        var data = { test: 'joe' };
        var str = new __1.StringExpression('test');
        assert.equal(str.expressionText, '=`test`');
        assert.equal(str.value, undefined);
        // let result = str.getValue(data);
        // assert.equal(result, 'test');
        str = new __1.StringExpression('=test');
        assert.equal(str.expressionText, '=test');
        assert.equal(str.value, undefined);
        // result = str.getValue(data);
        // assert.equal(result, 'joe');
        str = new __1.StringExpression('Hello ${test}');
        assert.equal(str.expressionText, '=`Hello ${test}`');
        assert.equal(str.value, undefined);
        // result = str.getValue(data);
        // assert.equal(result, 'Hello joe');
    });
    it('ValueExpression', function () {
        var data = { test: { x: 13 } };
        var val = new __1.ValueExpression('test');
        assert.equal(val.expressionText, '=`test`');
        assert.equal(val.value, undefined);
        // let result = val.getValue(data);
        // assert.equal(result, 'test');
        val = new __1.ValueExpression('=test');
        assert.equal(val.expressionText, '=test');
        assert.equal(val.value, undefined);
        var result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));
        val = new __1.ValueExpression(data.test);
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        // result = val.getValue(data);
        // assert.equal(JSON.stringify(result), JSON.stringify(data.test));
        val = new __1.ValueExpression('Hello ${test.x}');
        assert.equal(val.expressionText, '=`Hello ${test.x}`');
        assert.equal(val.value, undefined);
        // result = val.getValue(data);
        // assert.equal(result, 'Hello 13');
    });
});
