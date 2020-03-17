/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as assert from 'assert';
import { ArrayExpression, BoolExpression, EnumExpression, NumberExpression, ObjectExpression, StringExpression, ValueExpression, DialogExpression, AdaptiveDialog } from '../';

describe('expressionProperty tests', () => {
    it('ArrayExpression string', () => {
        class ArrFoo { public strings: string[] };
        const test: ArrFoo = { strings: ['a', 'b', 'c'] };
        const data = { test };

        let val = new ArrayExpression<string>('test.strings');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result, data.test.strings);

        val = new ArrayExpression<string>('=test.strings');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.strings);

        val = new ArrayExpression<string>(data.test.strings);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.strings);
    });

    it('ArrayExpression object', () => {
        class Foo { public age: number; public name: string; };
        class ArrFoo { public objects: Foo[] };
        const foo: Foo = { age: 13, name: 'joe' };
        const test: ArrFoo = { objects: [foo] };
        const data = { test };

        let val = new ArrayExpression<Foo>('test.objects');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result, data.test.objects);

        val = new ArrayExpression<Foo>('=test.objects');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.objects);

        val = new ArrayExpression<Foo>(data.test.objects);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, data.test.objects);
    });

    it('BoolExpression', () => {
        const data = { test: true };

        let val = new BoolExpression('true');
        assert.equal(val.expressionText, 'true');
        let result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression('=true');
        assert.equal(val.expressionText, 'true');
        result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression(true);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, true);
        result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression('=test');
        assert.equal(val.expressionText, 'test');
        result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression();
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, false);
        result = val.getValue(data);
        assert.equal(result, false);
    });

    it('DialogExpression', () => {
        const dialog = new AdaptiveDialog('AskNameDialog');
        const data = { test: dialog };
        let val = new DialogExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result, dialog);

        val = new DialogExpression('test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 'test');

        val = new DialogExpression(dialog);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, dialog);
    });

    it('EnumExpression', () => {
        enum TestEnum { One, Two, Three };
        const data = { test: TestEnum.Three };

        let val = new EnumExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result, TestEnum.Three);

        val = new EnumExpression(TestEnum.Three);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, TestEnum.Three);
        result = val.getValue(data);
        assert.equal(result, TestEnum.Three);
    });

    it('NumberExpression', function() {
        const data = { test: 3.14 };

        let val = new NumberExpression('test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression('3.14');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression('=3.14');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression(3.14);
        assert.equal(val.expressionText, undefined);
        assert.equal(val.value, 3.14);
        result = val.getValue(data);
        assert.equal(result, 3.14);
    });

    it('ObjectExpression', () => {
        class Foo { public age: number; public name: string };
        const foo: Foo = { age: 13, name: 'joe' };
        const data = { test: foo };

        let val = new ObjectExpression<Foo>('test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');

        val = new ObjectExpression<Foo>('=test');
        assert.notEqual(val.expressionText, undefined);
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');

        val = new ObjectExpression<Foo>(data.test);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
    });

    it('StringExpression', () => {
        const data = { test: 'joe' };

        let str = new StringExpression('test');
        assert.equal(str.expressionText, '=`test`');
        assert.equal(str.value, undefined);
        let result = str.getValue(data);
        assert.equal(result, 'test');

        str = new StringExpression('=test');
        assert.equal(str.expressionText, '=test');
        assert.equal(str.value, undefined);
        result = str.getValue(data);
        assert.equal(result, 'joe');

        str = new StringExpression('Hello ${test}');
        assert.equal(str.expressionText, '=`Hello ${test}`');
        assert.equal(str.value, undefined);
        result = str.getValue(data);
        assert.equal(result, 'Hello joe');
    });

    it('ValueExpression', () => {
        const data = { test: { x: 13 } };

        let val = new ValueExpression('test');
        assert.equal(val.expressionText, '=`test`');
        assert.equal(val.value, undefined);
        let result = val.getValue(data);
        assert.equal(result, 'test');

        val = new ValueExpression('=test');
        assert.equal(val.expressionText, '=test');
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));

        val = new ValueExpression(data.test);
        assert.equal(val.expressionText, undefined);
        assert.notEqual(val.value, undefined);
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));

        val = new ValueExpression('Hello ${test.x}');
        assert.equal(val.expressionText, '=`Hello ${test.x}`');
        assert.equal(val.value, undefined);
        result = val.getValue(data);
        assert.equal(result, 'Hello 13');
    });
});