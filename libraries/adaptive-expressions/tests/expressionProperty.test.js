"use strict";
exports.__esModule = true;
/* eslint-disable @typescript-eslint/explicit-function-return-type */
var assert = require("assert");
var lib_1 = require("../lib");
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
        var val = new lib_1.ArrayExpression('test.strings');
        var result = val.getValue(data);
        assert.equal(result, data.test.strings);
        val = new lib_1.ArrayExpression('=test.strings');
        result = val.getValue(data);
        assert.equal(result, data.test.strings);
        val = new lib_1.ArrayExpression(data.test.strings);
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
        var val = new lib_1.ArrayExpression('test.objects');
        var result = val.getValue(data);
        assert.equal(result, data.test.objects);
        val = new lib_1.ArrayExpression('=test.objects');
        result = val.getValue(data);
        assert.equal(result, data.test.objects);
        val = new lib_1.ArrayExpression(data.test.objects);
        result = val.getValue(data);
        assert.equal(result, data.test.objects);
    });
    it('BoolExpression', function () {
        var data = { test: true };
        var val = new lib_1.BoolExpression('true');
        var result = val.getValue(data);
        assert.equal(result, true);
        val = new lib_1.BoolExpression('=true');
        result = val.getValue(data);
        assert.equal(result, true);
        val = new lib_1.BoolExpression(true);
        result = val.getValue(data);
        assert.equal(result, true);
        val = new lib_1.BoolExpression('=test');
        result = val.getValue(data);
        assert.equal(result, true);
        val = new lib_1.BoolExpression();
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
        var val = new lib_1.EnumExpression('=test');
        var result = val.getValue(data);
        assert.equal(result, TestEnum.Three);
        val = new lib_1.EnumExpression(TestEnum.Three);
        result = val.getValue(data);
        assert.equal(result, TestEnum.Three);
    });
    it('NumberExpression', function () {
        var data = { test: 3.14 };
        var val = new lib_1.NumberExpression('test');
        var result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new lib_1.NumberExpression('=test');
        result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new lib_1.NumberExpression('3.14');
        result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new lib_1.NumberExpression('=3.14');
        result = val.getValue(data);
        assert.equal(result, 3.14);
        val = new lib_1.NumberExpression(3.14);
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
        var val = new lib_1.ObjectExpression('test');
        var result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
        val = new lib_1.ObjectExpression('=test');
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
        val = new lib_1.ObjectExpression(data.test);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
    });
    it('StringExpression', function () {
        var data = { test: 'joe' };
        var str = new lib_1.StringExpression('test');
        var result = str.getValue(data);
        assert.equal(result, 'test');
        str = new lib_1.StringExpression('=test');
        result = str.getValue(data);
        assert.equal(result, 'joe');
        str = new lib_1.StringExpression('Hello ${test}');
        result = str.getValue(data);
        assert.equal(result, 'Hello joe');
    });
    it('ValueExpression', function () {
        var data = { test: { x: 13 } };
        var val = new lib_1.ValueExpression('test');
        var result = val.getValue(data);
        assert.equal(result, 'test');
        val = new lib_1.ValueExpression('=test');
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));
        val = new lib_1.ValueExpression(data.test);
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));
        val = new lib_1.ValueExpression('Hello ${test.x}');
        result = val.getValue(data);
        assert.equal(result, 'Hello 13');
    });
});
