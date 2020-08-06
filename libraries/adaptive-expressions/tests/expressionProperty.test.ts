/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as assert from 'assert';
import { ArrayExpression, BoolExpression, EnumExpression, NumberExpression, ObjectExpression, StringExpression, ValueExpression, ExpressionParser } from '../lib';

describe('expressionProperty tests', () => {
    it('ArrayExpression string', () => {
        class ArrFoo { public strings: string[] };
        const test: ArrFoo = { strings: ['a', 'b', 'c'] };
        const data = { test };

        let val = new ArrayExpression<string>('test.strings');
        let result = val.getValue(data);
        assert.equal(result, data.test.strings);

        val = new ArrayExpression<string>('=test.strings');
        result = val.getValue(data);
        assert.equal(result, data.test.strings);

        val = new ArrayExpression<string>(data.test.strings);
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
        let result = val.getValue(data);
        assert.equal(result, data.test.objects);

        val = new ArrayExpression<Foo>('=test.objects');
        result = val.getValue(data);
        assert.equal(result, data.test.objects);

        val = new ArrayExpression<Foo>(data.test.objects);
        result = val.getValue(data);
        assert.equal(result, data.test.objects);
    });

    it('BoolExpression', () => {
        const data = { test: true };

        let val = new BoolExpression('true');
        let result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression('=true');
        result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression(true);
        result = val.getValue(data);
        assert.equal(result, true);
        assert.equal(val.toExpression().toString(), 'true');

        val = new BoolExpression('=test');
        result = val.getValue(data);
        assert.equal(result, true);

        val = new BoolExpression();
        result = val.getValue(data);
        assert.equal(result, false);

        val = new BoolExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.equal(result, true);
        assert.equal(val.toExpression().toString(), 'test');
    });

    it('EnumExpression', () => {
        enum TestEnum { One, Two, Three };
        const data = { test: TestEnum.Three };

        let val = new EnumExpression<TestEnum>('=test');
        let result = val.getValue(data);
        assert.equal(result, TestEnum.Three);

        val = new EnumExpression<TestEnum>(TestEnum.Three);
        result = val.getValue(data);
        assert.equal(result, TestEnum.Three);

        val = new NumberExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.equal(result, TestEnum.Three);
    });

    it('NumberExpression', function() {
        const data = { test: 3.14 };

        let val = new NumberExpression('test');
        let result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression('=test');
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression('3.14');
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression('=3.14');
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression(3.14);
        result = val.getValue(data);
        assert.equal(result, 3.14);

        val = new NumberExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.equal(result, 3.14);
    });

    it('ObjectExpression', () => {
        class Foo { public age: number; public name: string };
        const foo: Foo = { age: 13, name: 'joe' };
        const data = { test: foo };

        let val = new ObjectExpression<Foo>('test');
        let result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');

        val = new ObjectExpression<Foo>('=test');
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');

        val = new ObjectExpression<Foo>(data.test);
        result = val.getValue(data);
        assert.equal(result.age, 13);
        assert.equal(result.name, 'joe');
        assert.equal(val.toExpression().toString().startsWith('json'), true);
    });

    it('StringExpression', () => {
        const data = { test: 'joe' };

        let str = new StringExpression('test');
        let result = str.getValue(data);
        assert.equal(result, 'test');

        str = new StringExpression('=test');
        result = str.getValue(data);
        assert.equal(result, 'joe');

        str = new StringExpression('\\=test');
        result = str.getValue(data);
        assert.equal(result, '=test');

        str = new StringExpression('Hello ${test}');
        result = str.getValue(data);
        assert.equal(result, 'Hello joe');

        str = new StringExpression(new ExpressionParser().parse('test'));
        result = str.getValue(data);
        assert.equal(result, 'joe');
        assert.equal(str.toExpression().toString(), 'test');

        // slashes are the chars
        str = new StringExpression('c:\\test\\test\\test')
        result = str.getValue(data)
        assert.equal(result, 'c:\\test\\test\\test')

        // tabs are the chars
        str = new StringExpression('c:\test\test\test')
        result = str.getValue(data)
        assert.equal(result, 'c:\test\test\test')
    });

    it('ValueExpression', () => {
        const data = { test: { x: 13 } };

        let val = new ValueExpression('test');
        let result = val.getValue(data);
        assert.equal(result, 'test');

        val = new ValueExpression('=test');
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));

        val = new ValueExpression('\\=test');
        result = val.getValue(data);
        assert.equal(result, '=test');

        val = new ValueExpression(data.test);
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));

        val = new ValueExpression('Hello ${test.x}');
        result = val.getValue(data);
        assert.equal(result, 'Hello 13');

        val = new ValueExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.equal(JSON.stringify(result), JSON.stringify(data.test));
        assert.equal(val.toExpression().toString(), 'test');

        val = new ValueExpression(undefined);
        result = val.getValue(data);
        assert.equal(result, undefined);
        assert.equal(val.toExpression().toString(), 'null');

        // slashes are the chars
        val = new ValueExpression('c:\\test\\test\\test')
        result = val.getValue(data)
        assert.equal(result, 'c:\\test\\test\\test')

        // tabs are the chars
        val = new ValueExpression('c:\test\test\test')
        result = val.getValue(data)
        assert.equal(result, 'c:\test\test\test')
    });
});