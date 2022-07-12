import * as assert from 'assert';
import {
    ArrayExpression,
    BoolExpression,
    EnumExpression,
    NumberExpression,
    ObjectExpression,
    StringExpression,
    ValueExpression,
    ExpressionParser,
} from '../lib';

describe('expressionProperty tests', function () {
    it('ArrayExpression string', function () {
        class ArrFoo {
            strings: string[];
        }
        const test: ArrFoo = { strings: ['a', 'b', 'c'] };
        const data = { test };

        let val = new ArrayExpression<string>('test.strings');
        let result = val.getValue(data);
        assert.strictEqual(result, data.test.strings);

        val = new ArrayExpression<string>('=test.strings');
        result = val.getValue(data);
        assert.strictEqual(result, data.test.strings);

        val = new ArrayExpression<string>(data.test.strings);
        result = val.getValue(data);
        assert.strictEqual(result, data.test.strings);
    });

    it('ArrayExpression object', function () {
        class Foo {
            age: number;
            name: string;
        }
        class ArrFoo {
            objects: Foo[];
        }
        const foo: Foo = { age: 13, name: 'joe' };
        const test: ArrFoo = { objects: [foo] };
        const data = { test };

        let val = new ArrayExpression<Foo>('test.objects');
        let result = val.getValue(data);
        assert.strictEqual(result, data.test.objects);

        val = new ArrayExpression<Foo>('=test.objects');
        result = val.getValue(data);
        assert.strictEqual(result, data.test.objects);

        val = new ArrayExpression<Foo>(data.test.objects);
        result = val.getValue(data);
        assert.strictEqual(result, data.test.objects);
    });

    it('BoolExpression', function () {
        const data = { test: true };

        let val = new BoolExpression('true');
        let result = val.getValue(data);
        assert.strictEqual(result, true);

        val = new BoolExpression('=true');
        result = val.getValue(data);
        assert.strictEqual(result, true);

        val = new BoolExpression(true);
        result = val.getValue(data);
        assert.strictEqual(result, true);
        assert.strictEqual(val.toExpression().toString(), 'true');

        val = new BoolExpression('=test');
        result = val.getValue(data);
        assert.strictEqual(result, true);

        val = new BoolExpression();
        result = val.getValue(data);
        assert.strictEqual(result, false);

        val = new BoolExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.strictEqual(result, true);
        assert.strictEqual(val.toExpression().toString(), 'test');
    });

    it('EnumExpression', function () {
        enum TestEnum {
            One,
            Two,
            Three,
        }
        const data = { test: TestEnum.Three };

        let val = new EnumExpression<TestEnum>('=test');
        let result = val.getValue(data);
        assert.strictEqual(result, TestEnum.Three);

        val = new EnumExpression<TestEnum>(TestEnum.Three);
        result = val.getValue(data);
        assert.strictEqual(result, TestEnum.Three);

        val = new NumberExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.strictEqual(result, TestEnum.Three);
    });

    it('NumberExpression', function () {
        const data = { test: 3.14 };

        let val = new NumberExpression('test');
        let result = val.getValue(data);
        assert.strictEqual(result, 3.14);

        val = new NumberExpression('=test');
        result = val.getValue(data);
        assert.strictEqual(result, 3.14);

        val = new NumberExpression('3.14');
        result = val.getValue(data);
        assert.strictEqual(result, 3.14);

        val = new NumberExpression('=3.14');
        result = val.getValue(data);
        assert.strictEqual(result, 3.14);

        val = new NumberExpression(3.14);
        result = val.getValue(data);
        assert.strictEqual(result, 3.14);

        val = new NumberExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.strictEqual(result, 3.14);
    });

    it('ObjectExpression', function () {
        class Foo {
            age: number;
            name: string;
        }
        const foo: Foo = { age: 13, name: 'joe' };
        const data = { test: foo };

        let val = new ObjectExpression<Foo>('test');
        let result = val.getValue(data);
        assert.strictEqual(result.age, 13);
        assert.strictEqual(result.name, 'joe');

        val = new ObjectExpression<Foo>('=test');
        result = val.getValue(data);
        assert.strictEqual(result.age, 13);
        assert.strictEqual(result.name, 'joe');

        val = new ObjectExpression<Foo>(data.test);
        result = val.getValue(data);
        assert.strictEqual(result.age, 13);
        assert.strictEqual(result.name, 'joe');
        assert(val.toExpression().toString().startsWith('json'));
    });

    it('StringExpression', function () {
        const data = { test: 'joe' };

        let str = new StringExpression('test');
        let result = str.getValue(data);
        assert.strictEqual(result, 'test');

        str = new StringExpression('=test');
        result = str.getValue(data);
        assert.strictEqual(result, 'joe');

        str = new StringExpression('\\=test');
        result = str.getValue(data);
        assert.strictEqual(result, '=test');

        str = new StringExpression('Hello ${test}');
        result = str.getValue(data);
        assert.strictEqual(result, 'Hello joe');

        str = new StringExpression(new ExpressionParser().parse('test'));
        result = str.getValue(data);
        assert.strictEqual(result, 'joe');
        assert.strictEqual(str.toExpression().toString(), 'test');

        // slashes are the chars
        str = new StringExpression('c:\\test\\test\\test');
        result = str.getValue(data);
        assert.strictEqual(result, 'c:\\test\\test\\test');

        // tabs are the chars
        str = new StringExpression('c:\test\test\test');
        result = str.getValue(data);
        assert.strictEqual(result, 'c:\test\test\test');

        // test backtick in stringExpression
        str = new StringExpression('test `name');
        result = str.getValue(data);
        assert.strictEqual(result, 'test `name');

        str = new StringExpression('test //`name');
        result = str.getValue(data);
        assert.strictEqual(result, 'test //`name');

        // test new line
        str = new StringExpression('[test](./test)\n*');
        result = str.getValue(data);
        assert.strictEqual(result, '[test](./test)\n*');
    });

    it('ValueExpression', function () {
        const data = { test: { x: 13 } };

        let val = new ValueExpression('test');
        let result = val.getValue(data);
        assert.strictEqual(result, 'test');

        val = new ValueExpression('=test');
        result = val.getValue(data);
        assert.strictEqual(JSON.stringify(result), JSON.stringify(data.test));

        val = new ValueExpression('\\=test');
        result = val.getValue(data);
        assert.strictEqual(result, '=test');

        val = new ValueExpression(data.test);
        result = val.getValue(data);
        assert.strictEqual(JSON.stringify(result), JSON.stringify(data.test));

        val = new ValueExpression('Hello ${test.x}');
        result = val.getValue(data);
        assert.strictEqual(result, 'Hello 13');

        val = new ValueExpression(new ExpressionParser().parse('test'));
        result = val.getValue(data);
        assert.strictEqual(JSON.stringify(result), JSON.stringify(data.test));
        assert.strictEqual(val.toExpression().toString(), 'test');

        val = new ValueExpression(undefined);
        result = val.getValue(data);
        assert.strictEqual(result, undefined);
        assert.strictEqual(val.toExpression().toString(), 'undefined');

        // slashes are the chars
        val = new ValueExpression('c:\\test\\test\\test');
        result = val.getValue(data);
        assert.strictEqual(result, 'c:\\test\\test\\test');

        // tabs are the chars
        val = new ValueExpression('c:\test\test\test');
        result = val.getValue(data);
        assert.strictEqual(result, 'c:\test\test\test');

        // test backtick in valueExpression
        val = new ValueExpression('name `backtick');
        result = val.getValue(data);
        assert.strictEqual(result, 'name `backtick');

        val = new ValueExpression('name \\`backtick');
        result = val.getValue(data);
        assert.strictEqual(result, 'name \\`backtick');

        // test new line
        val = new ValueExpression('[test](./test)\n*');
        result = val.getValue(data);
        assert.strictEqual(result, '[test](./test)\n*');
    });
});
