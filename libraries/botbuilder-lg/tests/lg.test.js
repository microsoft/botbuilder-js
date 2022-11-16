/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-fs-filename */
const {
    Templates,
    LGLineBreakStyle,
    EvaluationOptions,
    TemplateErrors,
    DiagnosticSeverity,
    CustomizedMemory,
    LGCacheScope,
    LGResource,
} = require('../');
const {
    SimpleObjectMemory,
    ExpressionParser,
    NumericEvaluator,
    Expression,
    StackedMemory,
} = require('adaptive-expressions');
const assert = require('assert');
const fs = require('fs');

function GetExampleFilePath(fileName) {
    return `${__dirname}/testData/examples/` + fileName;
}

describe('LG', function () {
    /**
     * Disk I/O is slow and variable, causing issues in pipeline tests, so we
     * preload all of the file reads here so that it doesn't count against individual test duration.
     *
     * Note that parseFile() calls injectToExpressionFunction(), so any test dependent on
     * Expression.function.add() cannot be preloaded. In these cases, it would be a good idea to use
     * this.timeout(5000) to increase test timeout for those individual tests.
     */
    const preloaded = {
        two: Templates.parseFile(GetExampleFilePath('2.lg')),
        three: Templates.parseFile(GetExampleFilePath('3.lg')),
        four: Templates.parseFile(GetExampleFilePath('4.lg')),
        five: Templates.parseFile(GetExampleFilePath('5.lg')),
        nine: Templates.parseFile(GetExampleFilePath('9.lg')),
        Multiline: Templates.parseFile(GetExampleFilePath('Multiline.lg')),
        MultiLineExpr: Templates.parseFile(GetExampleFilePath('MultiLineExpr.lg')),
        ExpandText: Templates.parseFile(GetExampleFilePath('ExpandText.lg')),
        six: Templates.parseFile(GetExampleFilePath('6.lg')),
        switchcase: Templates.parseFile(GetExampleFilePath('switchcase.lg')),
        BasicList: Templates.parseFile(GetExampleFilePath('BasicList.lg')),
        CaseInsensitive: Templates.parseFile(GetExampleFilePath('CaseInsensitive.lg')),
        eight: Templates.parseFile(GetExampleFilePath('8.lg')),
        TemplateNameWithDot: Templates.parseFile(GetExampleFilePath('TemplateNameWithDot.lg')),
        MultilineTextForAdaptiveCard: Templates.parseFile(GetExampleFilePath('MultilineTextForAdaptiveCard.lg')),
        TemplateRef: Templates.parseFile(GetExampleFilePath('TemplateRef.lg')),
        EscapeCharacter: Templates.parseFile(GetExampleFilePath('EscapeCharacter.lg')),
        Analyzer: Templates.parseFile(GetExampleFilePath('Analyzer.lg')),
        lgTemplate: Templates.parseFile(GetExampleFilePath('lgTemplate.lg')),
        TemplateAsFunction: Templates.parseFile(GetExampleFilePath('TemplateAsFunction.lg')),
        import: Templates.parseFile(GetExampleFilePath('importExamples/import.lg')),
        Regex: Templates.parseFile(GetExampleFilePath('Regex.lg')),
        Expand: Templates.parseFile(GetExampleFilePath('Expand.lg')),
        StrictModeFalse: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/StrictModeFalse.lg')),
        EvalExpression: Templates.parseFile(GetExampleFilePath('EvalExpression.lg')),
        RecursiveTemplate: Templates.parseFile(GetExampleFilePath('RecursiveTemplate.lg')),
        MemoryScope: Templates.parseFile(GetExampleFilePath('MemoryScope.lg')),
        StructuredTemplate: Templates.parseFile(GetExampleFilePath('StructuredTemplate.lg')),
        TemplateCache: Templates.parseFile(GetExampleFilePath('TemplateCache.lg')),
        ConditionExpression: Templates.parseFile(GetExampleFilePath('ConditionExpression.lg')),
        ExpressionExtract: Templates.parseFile(GetExampleFilePath('ExpressionExtract.lg')),
        EmptyArrayAndObject: Templates.parseFile(GetExampleFilePath('EmptyArrayAndObject.lg')),
        Alias: Templates.parseFile(GetExampleFilePath('Alias.lg')),
        LGOptionsTest: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/LGOptionsTest.lg')),
        NullTolerant: Templates.parseFile(GetExampleFilePath('NullTolerant.lg')),
        IsTemplate: Templates.parseFile(GetExampleFilePath('IsTemplate.lg')),
        StringInterpolation: Templates.parseFile(GetExampleFilePath('StringInterpolation.lg')),
        MemoryAccess: Templates.parseFile(GetExampleFilePath('MemoryAccess.lg')),
        ReExecute: Templates.parseFile(GetExampleFilePath('ReExecute.lg')),
        FileOperation: Templates.parseFile(GetExampleFilePath('FileOperation.lg')),
        inject: Templates.parseFile(GetExampleFilePath('./injectionTest/inject.lg')),
        injectWithoutNamespace: Templates.parseFile(GetExampleFilePath('./injectionTest/injectWithoutNamespace.lg')),
        StrictModeTrue: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/StrictModeTrue.lg')),
        DefaultCache: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/DefaultCache.lg')),
        GlobalCache_1: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/GlobalCache_1.lg')),
        GlobalCache: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/GlobalCache.lg')),
        NoneCache: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/NoneCache.lg')),
        LocalCache: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/LocalCache.lg')),
        a1: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/a1.lg')),
        a2: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/a2.lg')),
        a3: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/a3.lg')),
        a4: Templates.parseFile(GetExampleFilePath('./EvaluationOptions/a4.lg')),
    };

    it('TestEnumeration', function () {
        let cnt = 0;
        const templates = preloaded.two;
        for (const t of templates) {
            assert.strictEqual(typeof t, 'object');
            assert.strictEqual(t.name, 'wPhrase');
            cnt++;
        }
        assert.strictEqual(cnt, 1);
    });

    it('TestBasic', function () {
        let templates = preloaded.two;
        let evaled = templates.evaluate('wPhrase');
        const options = ['Hi', 'Hello', 'Hiya'];
        assert(options.includes(evaled), `The result ${evaled} is not in those options [${options.join(',')}]`);

        templates = preloaded.nine;
        evaled = templates.evaluate('ResolveDateTime');
        assert.strictEqual(evaled, '2009-01-23T14:00:00.000Z');
    });

    it('TestBasicTemplateReference', function () {
        const templates = preloaded.three;
        const evaled = templates.evaluate('welcome_user', undefined);
        const options = ['Hi', 'Hello', 'Hiya', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert(options.includes(evaled), `The result ${evaled} is not in those options [${options.join(',')}]`);
    });

    it('TestBasicTemplateRefAndEntityRef', function () {
        const templates = preloaded.four;
        const userName = 'DL';
        const evaled = templates.evaluate('welcome_user', { userName: userName });
        assert(evaled.includes(userName), `The result ${evaled} does not contiain ${userName}`);
    });

    it('TestBasicConditionalTemplate', function () {
        const templates = preloaded['five'];

        let evaled = templates.evaluate('time_of_day_readout', { timeOfDay: 'morning' });
        assert(evaled === 'Good morning' || evaled === 'Morning! ', `Evaled is ${evaled}`);

        evaled = templates.evaluate('time_of_day_readout', { timeOfDay: 'evening' });
        assert(evaled === 'Good evening' || evaled === 'Evening! ', `Evaled is ${evaled}`);
    });

    it('TestMultiline', function () {
        const templates = preloaded.Multiline;
        let evaled = templates.evaluate('template1').toString();
        let generatedTemplates = Templates.parseResource(new LGResource('', '', evaled));
        let result = generatedTemplates.evaluate('generated1');
        assert.strictEqual(result, 'hi', `Evaled is ${result.trim()}`);

        evaled = templates.evaluate('template2', { evaluateNow: 'please input' }).toString();
        generatedTemplates = Templates.parseResource(new LGResource('', '', evaled));
        result = generatedTemplates.evaluate('generated2', { name: 'jack' });
        assert.strictEqual(result.trim(), 'please input jack', `Evaled is ${result.trim()}`);

        evaled = templates.evaluate('template3').toString();
        assert.strictEqual(
            evaled.replace(/\r\n/g, '\n'),
            'markdown\n## Manage the knowledge base\n',
            `Evaled is ${evaled}`
        );

        evaled = templates.evaluate('template4').toString();
        assert.strictEqual(evaled, '## Manage the knowledge base', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template5').toString();
        assert.strictEqual(evaled, '', `Evaled is ${evaled}`);
    });

    it('TestMultiLineExprLG', function () {
        const templates = preloaded.MultiLineExpr;

        let evaled = templates.evaluate('ExprInCondition', { userName: 'Henry', day: 'Monday' });
        assert(evaled === 'Not today', `Evaled is ${evaled}`);

        evaled = templates.evaluate('definition');
        assert.strictEqual(evaled, 10);

        evaled = templates.evaluate('template');
        assert.strictEqual(evaled, 15);

        evaled = templates.evaluate('crtObj');
        assert.deepStrictEqual(evaled, { a: 1, c: 3, b: 2 });

        const evaledArray = templates.evaluate('crtArr');
        assert.deepStrictEqual(evaledArray, [1, 2, 3, 4]);

        const evaledMultilineResult = templates.evaluate('evalMultiLineObj');
        assert.strictEqual(evaledMultilineResult, '{"a":1,"b":2,"c":{"d":4,"e":5}}');

        evaled = templates.evaluate('crtObj1');
        assert.deepStrictEqual(evaled, { a: 1, c: 3, b: 2 });

        evaled = templates.evaluate('crtObj2');
        assert.deepStrictEqual(evaled, { key: 'value' });

        evaled = templates.evaluate('crtObj3');
        assert.deepStrictEqual(evaled, { key1: { key2: 'value' }, key3: 'value2' });

        evaled = templates.evaluate('crtArr1');
        assert.deepStrictEqual(evaled, [1, 2, 3, 4]);

        evaled = templates.evaluate('crtArr2');
        assert.deepStrictEqual(evaled, [1, 2, 3, 4]);
    });

    it('TestBasicConditionalTemplateWithoutDefault', function () {
        const templates = preloaded.five;

        let evaled = templates.evaluate('time_of_day_readout_without_default', { timeOfDay: 'morning' });
        assert(evaled === 'Good morning' || evaled === 'Morning! ', `Evaled is ${evaled}`);

        evaled = templates.evaluate('time_of_day_readout_without_default2', { timeOfDay: 'morning' });
        assert(evaled === 'Good morning' || evaled === 'Morning! ', `Evaled is ${evaled}`);

        evaled = templates.evaluate('time_of_day_readout_without_default2', { timeOfDay: 'evening' });
        assert.strictEqual(evaled, undefined, `Evaled is ${evaled} which should be undefined.`);
    });

    it('TestExpandText', function () {
        const templates = preloaded.ExpandText;

        const scope = {
            '@answer': 'hello ${user.name}',
            user: {
                name: 'vivian',
            },
        };

        let evaled = templates.evaluate('template', scope);
        assert.strictEqual(evaled, 'hello vivian'.length);

        evaled = templates.evaluateText('${length(expandText(@answer))}', scope);
        assert.strictEqual(evaled, 'hello vivian'.length);
    });

    it('TestBasicTemplateRefWithParameters', function () {
        const templates = preloaded.six;

        let evaled = templates.evaluate('welcome', undefined);
        const options1 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        assert(options1.includes(evaled), `Evaled is ${evaled}`);

        const options2 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = templates.evaluate('welcome', { userName: 'DL' });
        assert(options2.includes(evaled), `Evaled is ${evaled}`);
    });

    it('TestBasicSwitchCaseTemplate', function () {
        const templates = preloaded.switchcase;
        const evaled1 = templates.evaluate('greetInAWeek', { day: 'Saturday' });
        assert(evaled1 === 'Happy Saturday!', `Evaled is ${evaled1}`);

        const evaled3 = templates.evaluate('greetInAWeek', { day: 'Monday' });
        assert(evaled3 === 'Work Hard!', `Evaled is ${evaled3}`);
    });

    it('TestBasicListSupport', function () {
        const templates = preloaded.BasicList;

        let evaled = templates.evaluate('BasicJoin', { items: ['1'] });
        assert.strictEqual(evaled, '1', `Evaled is ${evaled}`);

        evaled = templates.evaluate('BasicJoin', { items: ['1', '2'] });
        assert.strictEqual(evaled, '1, 2', `Evaled is ${evaled}`);

        evaled = templates.evaluate('BasicJoin', { items: ['1', '2', '3'] });
        assert.strictEqual(evaled, '1, 2 and 3', `Evaled is ${evaled}`);
    });

    it('TestBasicExtendedFunctions', function () {
        const templates = preloaded.six;
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow',
            },
            {
                time: '8 pm',
                date: 'tomorrow',
            },
        ];

        let evaled = templates.evaluate('ShowAlarmsWithForeach', { alarms: alarms });
        assert.strictEqual(evaled, 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', `Evaled is ${evaled}`);

        evaled = templates.evaluate('ShowAlarmsWithLgTemplate', { alarms: alarms });
        assert.strictEqual(evaled, 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', `Evaled is ${evaled}`);

        evaled = templates.evaluate('ShowAlarmsWithDynamicLgTemplate', { alarms: alarms, templateName: 'ShowAlarm' });
        assert.strictEqual(evaled, 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', `Evaled is ${evaled}`);
    });

    it('TestCaseInsensitive', function () {
        const templates = preloaded.CaseInsensitive;
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow',
            },
            {
                time: '8 pm',
                date: 'tomorrow',
            },
        ];

        const evaled = templates.evaluate('ShowAlarms', { alarms: alarms });
        assert.strictEqual(evaled, 'You have two alarms', `Evaled is ${evaled}`);

        const evaled1 = templates.evaluate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1, 'Happy Saturday!', `Evaled is ${evaled1}`);
    });

    it('TestListWithOnlyOneElement', function () {
        const templates = preloaded.eight;
        const evaled = templates.evaluate('ShowTasks', { recentTasks: ['Task1'] });
        assert.strictEqual(
            evaled,
            'Your most recent task is Task1. You can let me know if you want to add or complete a task.',
            `Evaled is ${evaled}`
        );
    });

    it('TestTemplateNameWithDotIn', function () {
        const templates = preloaded.TemplateNameWithDot;
        const evaled1 = templates.evaluate('Hello.World', '');
        assert.strictEqual(evaled1, 'Hello World', `Evaled is ${evaled1}`);

        const evaled2 = templates.evaluate('Hello', '');
        assert.strictEqual(evaled2, 'Hello World', `Evaled is ${evaled2}`);
    });

    it('TestMultiLine', function () {
        const templates = preloaded.MultilineTextForAdaptiveCard;
        const evaled1 = templates.evaluate('wPhrase', '');
        const options1 = ['\r\ncardContent\r\n', 'hello', '\ncardContent\n'];
        assert(options1.includes(evaled1), `1.Evaled is ${evaled1}`);

        const evaled2 = templates.evaluate('nameTemplate', { name: 'N' });
        const options2 = ['\r\nN\r\n', 'N', '\nN\n'];
        assert(options2.includes(evaled2), `2.Evaled is ${evaled2}`);

        templates.evaluate('adaptivecardsTemplate', '');

        const evaled4 = templates.evaluate('refTemplate', '');
        const options4 = ['\r\nhi\r\n', '\nhi\n'];
        assert(options4.includes(evaled4), `4.Evaled is ${evaled4}`);
    });

    it('TestTemplateRef', function () {
        const templates = preloaded.TemplateRef;
        const scope = { time: 'morning', name: 'Dong Lei' };
        const evaled1 = templates.evaluate('Hello', scope);
        assert.strictEqual(evaled1, 'Good morning Dong Lei', `Evaled is ${evaled1}`);
    });

    it('TestEscapeCharacter', function () {
        const templates = preloaded.EscapeCharacter;
        let evaled = templates.evaluate('wPhrase', undefined);
        assert.strictEqual(evaled, 'Hi \r\n\t\\', 'Happy path failed.');

        evaled = templates.evaluate('AtEscapeChar', undefined);
        assert.strictEqual(evaled, 'Hi{1+1}[wPhrase]{wPhrase()}${wPhrase()}2${1+1}', 'Happy path failed.');

        evaled = templates.evaluate('otherEscape', undefined);
        assert.strictEqual(evaled, 'Hi \\y \\', 'Happy path failed.');

        evaled = templates.evaluate('escapeInExpression', undefined);
        assert.strictEqual(evaled, 'Hi hello\\\\');

        evaled = templates.evaluate('escapeInExpression2', undefined);
        assert.strictEqual(evaled, "Hi hello'");

        evaled = templates.evaluate('escapeInExpression3', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = templates.evaluate('escapeInExpression4', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = templates.evaluate('escapeInExpression5', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = templates.evaluate('escapeInExpression6', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = templates.evaluate('showTodo', { todos: ['A', 'B', 'C'] });
        assert.strictEqual(
            evaled.replace(/\r\n/g, '\n'),
            '\n    Your most recent 3 tasks are\n    * A\n* B\n* C\n    '
        );

        evaled = templates.evaluate('showTodo', undefined);
        assert.strictEqual(evaled.replace(/\r\n/g, '\n'), '\n    You don\'t have any "t\\\\odo\'".\n    ');

        evaled = templates.evaluate('getUserName', undefined);
        assert.strictEqual(evaled, 'super "x man"');

        evaled = templates.evaluate('structure1', undefined);
        assert.strictEqual(evaled.lgType, 'struct');
        assert.strictEqual(evaled.list[0], 'a');
        assert.strictEqual(evaled.list[1], 'b|c');

        evaled = templates.evaluate('nestedSample', undefined);
        assert.strictEqual(evaled, 'i like three movies, they are "\\"name1", "name2" and "{name3"');

        evaled = templates.evaluate('dollarsymbol', undefined);
        assert.strictEqual(evaled, "$ $ ${'hi'} hi");
    });

    it('TestAnalyzer', function () {
        const testData = [
            {
                name: 'orderReadOut',
                variableOptions: ['orderType', 'userName', 'base', 'topping', 'bread', 'meat'],
                templateRefOptions: ['wPhrase', 'pizzaOrderConfirmation', 'sandwichOrderConfirmation'],
            },
            {
                name: 'sandwichOrderConfirmation',
                variableOptions: ['bread', 'meat'],
                templateRefOptions: [],
            },
            {
                name: 'template1',
                // TODO: input.property should really be: customer.property but analyzer needs to be
                variableOptions: ['alarms', 'customer', 'tasks[0]', 'age', 'city'],
                templateRefOptions: ['template2', 'template3', 'template4', 'template5', 'template6'],
            },
            {
                name: 'coffee_to_go_order',
                variableOptions: ['coffee', 'userName', 'size', 'price'],
                templateRefOptions: [
                    'wPhrase',
                    'LatteOrderConfirmation',
                    'MochaOrderConfirmation',
                    'CuppuccinoOrderConfirmation',
                ],
            },
            {
                name: 'structureTemplate',
                variableOptions: ['text', 'newText'],
                templateRefOptions: ['ST2'],
            },
            {
                name: 'addEntries',
                variableOptions: ['object', 'entries'],
                templateRefOptions: ['addEntry', 'addEntries'],
            },
            {
                name: 'sortNumber',
                variableOptions: ['number', 'divisor'],
                templateRefOptions: ['sortNumber'],
            },
        ];

        const templates = preloaded.Analyzer;
        for (const testItem of testData) {
            const evaled1 = templates.analyzeTemplate(testItem.name);
            const variableEvaled = evaled1.Variables;
            const variableEvaledOptions = testItem.variableOptions;
            assert.strictEqual(variableEvaled.length, variableEvaledOptions.length);
            variableEvaledOptions.forEach((element) => assert.strictEqual(variableEvaled.includes(element), true));
            const templateEvaled = evaled1.TemplateReferences;
            const templateEvaledOptions = testItem.templateRefOptions;
            assert.strictEqual(templateEvaled.length, templateEvaledOptions.length);
            templateEvaledOptions.forEach((element) => assert.strictEqual(templateEvaled.includes(element), true));
        }
    });

    it('TestlgTemplateFunction', function () {
        const templates = preloaded.lgTemplate;
        let evaled = templates.evaluate('TemplateC', '');
        let options = ['Hi', 'Hello'];
        assert(options.includes(evaled));

        evaled = templates.evaluate('TemplateD', { b: 'morning' });
        options = ['Hi morning', 'Hello morning'];
        assert(options.includes(evaled));
    });

    it('TestTemplateAsFunction', function () {
        const templates = preloaded.TemplateAsFunction;

        let evaled = templates.evaluate('Test2');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${evaled}`);

        evaled = templates.evaluate('Test3');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${evaled}`);

        evaled = templates.evaluate('Test4');
        assert.strictEqual(evaled.trim(), 'hello world', `Evaled is ${evaled}`);

        evaled = templates.evaluate('dupNameWithTemplate');
        assert.strictEqual(evaled, 2, `Evaled is ${evaled}`);

        evaled = templates.evaluate('compose', { property: 'Show' });
        assert.strictEqual(evaled, 'you made it!');
    });

    it('TestAnalyzelgTemplateFunction', function () {
        const templates = preloaded.lgTemplate;
        const evaled = templates.analyzeTemplate('TemplateD');
        const variableEvaled = evaled.Variables;
        const options = ['b'];
        assert.strictEqual(variableEvaled.length, options.length);
        options.forEach((e) => assert(variableEvaled.includes(e)));
    });

    it('TestImporttemplates', function () {
        let templates = preloaded.import;

        // Assert 6.lg is imported only once when there are several relative paths which point to the same file.
        // Assert import cycle loop is handled well as expected when a file imports itself.
        assert.strictEqual(templates.allTemplates.length, 14);

        const options1 = ['Hi', 'Hello', 'Hey'];
        let evaled = templates.evaluate('basicTemplate');
        assert(options1.includes(evaled), `Evaled is ${evaled}`);

        const options2 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        evaled = templates.evaluate('welcome');
        assert(options2.includes(evaled), `Evaled is ${evaled}`);

        const options3 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = templates.evaluate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${evaled}`);

        const options4 = ['Hi 2', 'Hello 2'];
        evaled = templates.evaluate('basicTemplate2');
        assert(options4.includes(evaled), `Evaled is ${evaled}`);

        const options5 = ['Hi 2', 'Hello 2'];
        evaled = templates.evaluate('template3');
        assert(options5.includes(evaled), `Evaled is ${evaled}`);

        // Assert 6.lg of relative path is imported from text.
        const resource = new LGResource(
            GetExampleFilePath('xx.lg'),
            GetExampleFilePath('xx.lg'),
            '[import](./6.lg)\r\n# basicTemplate\r\n- Hi\r\n- Hello\r\n'
        );
        templates = Templates.parseResource(resource);

        assert.strictEqual(templates.allTemplates.length, 8);

        evaled = templates.evaluate('basicTemplate');
        assert(options1.includes(evaled), `Evaled is ${evaled}`);

        evaled = templates.evaluate('welcome');
        assert(options2.includes(evaled), `Evaled is ${evaled}`);

        evaled = templates.evaluate('welcome', { userName: 'DL' });
        assert(options3.includes(evaled), `Evaled is ${evaled}`);
    });

    it('TestRegex', function () {
        const templates = preloaded.Regex;
        let evaled = templates.evaluate('wPhrase');
        assert.strictEqual(evaled, 'Hi');

        evaled = templates.evaluate('wPhrase', { name: 'jack' });
        assert.strictEqual(evaled, 'Hi jack');

        evaled = templates.evaluate('wPhrase', { name: 'morethanfive' });
        assert.strictEqual(evaled, 'Hi');
    });

    it('TestExpandTemplate', function () {
        const templates = preloaded.Expand;

        // without scope
        let evaled = templates.expandTemplate('FinalGreeting');
        assert.strictEqual(evaled.length, 4, `Evaled is ${evaled}`);
        let expectedResults = ['Hi Morning', 'Hi Evening', 'Hello Morning', 'Hello Evening'];
        expectedResults.forEach((x) => assert(evaled.includes(x)));

        // with scope
        evaled = templates.expandTemplate('TimeOfDayWithCondition', { time: 'evening' });
        assert.strictEqual(evaled.length, 2, `Evaled is ${evaled}`);
        expectedResults = ['Hi Evening', 'Hello Evening'];
        expectedResults.forEach((x) => assert(evaled.includes(x)));

        // with scope
        evaled = templates.expandTemplate('greetInAWeek', { day: 'Sunday' });
        assert.strictEqual(evaled.length, 2, `Evaled is ${evaled}`);
        expectedResults = ['Nice Sunday!', 'Happy Sunday!'];
        expectedResults.forEach((x) => assert(evaled.includes(x)));
    });

    it('TestExpandTemplateWithRef', function () {
        const templates = preloaded.Expand;

        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow',
            },
            {
                time: '8 pm',
                date: 'tomorrow',
            },
        ];

        const evaled = templates.expandTemplate('ShowAlarmsWithLgTemplate', { alarms });
        assert.strictEqual(evaled.length, 2, `Evaled is ${evaled}`);
        assert.strictEqual(evaled[0], 'You have 2 alarms, they are 8 pm at tomorrow', `Evaled is ${evaled}`);
        assert.strictEqual(evaled[1], 'You have 2 alarms, they are 8 pm of tomorrow', `Evaled is ${evaled}`);
    });

    it('TestExpandTemplateWithRefInMultiLine', function () {
        const templates = preloaded.Expand;

        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow',
            },
            {
                time: '8 pm',
                date: 'tomorrow',
            },
        ];

        const evaled = templates.expandTemplate('ShowAlarmsWithMultiLine', { alarms });
        assert.strictEqual(evaled.length, 2, `Evaled is ${evaled}`);
        const eval1Options = [
            '\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n',
            '\nYou have 2 alarms.\nThey are 8 pm at tomorrow\n',
        ];
        const eval2Options = [
            '\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n',
            '\nYou have 2 alarms.\nThey are 8 pm of tomorrow\n',
        ];
        assert(eval1Options.includes(evaled[0]));
        assert(eval2Options.includes(evaled[1]));
    });

    it('TestExpandTemplateWithFunction', function () {
        const templates = preloaded.Expand;

        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow',
            },
            {
                time: '8 pm',
                date: 'tomorrow',
            },
        ];

        let evaled = templates.expandTemplate('ShowAlarmsWithForeach', { alarms });
        assert.strictEqual(evaled.length, 1, `Evaled is ${evaled}`);
        const evalOptions = [
            'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am at tomorrow and 8 pm of tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm of tomorrow',
        ];

        assert(evalOptions.includes(evaled[0]));

        evaled = templates.expandTemplate('T2');
        assert.strictEqual(evaled.length, 1, `Evaled is ${evaled}`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = templates.expandTemplate('T3');
        assert.strictEqual(evaled.length, 1, `Evaled is ${evaled}`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = templates.expandTemplate('T4');
        assert.strictEqual(evaled.length, 1, `Evaled is ${evaled}`);
        assert(evaled[0] === 'ey' || evaled[0] === 'el');
    });

    it('TestExpandTemplateWithIsTemplateFunction', function () {
        const templates = preloaded.Expand;

        let evaled = templates.expandTemplate('template2', { templateName: 'Greeting' });
        assert.strictEqual(evaled.length, 2);
        assert.strictEqual(evaled[0], 'Hi');
        assert.strictEqual(evaled[1], 'Hello');

        evaled = templates.expandTemplate('template2', { templateName: 'xxx' });
        assert.strictEqual(evaled.length, 2);
        assert.strictEqual(evaled[0], 'Morning');
        assert.strictEqual(evaled[1], 'Evening');
    });

    it('TestExpandTemplateWithTemplateFunction', function () {
        const templates = preloaded.Expand;

        const evaled = templates.expandTemplate('template3', { templateName: 'Greeting' });
        assert.strictEqual(evaled.length, 2);
        assert.strictEqual(evaled[0], 'Hi');
        assert.strictEqual(evaled[1], 'Hello');
    });

    it('TestExpandTemplateWithDoubleQuotation', function () {
        const templates = preloaded.Expand;

        const evaled = templates.expandTemplate('ExpanderT1');
        assert.strictEqual(evaled.length, 2);
        const expectedResults = [
            '{"lgType":"MyStruct","text":"Hi \\"quotes\\" allowed","speak":"how old are you?"}',
            '{"lgType":"MyStruct","text":"Hi \\"quotes\\" allowed","speak":"what\'s your age?"}',
        ];

        expectedResults.forEach((value, index) => {
            assert.strictEqual(JSON.stringify(evaled[index]), JSON.stringify(JSON.parse(value)));
        });
    });

    it('TestExpandTemplateWithBackSlash', function () {
        const templates = preloaded.Expand;

        const evaled = templates.expandTemplate('ExpanderT1BackSlash');
        assert.strictEqual(evaled.length, 2);
        const expectedResults = [
            '{"lgType":"MyStruct","text":"Hi \\\\backslash\\\\ allowed","speak":"how old are you?"}',
            '{"lgType":"MyStruct","text":"Hi \\\\backslash\\\\ allowed","speak":"what\'s your age?"}',
        ];

        expectedResults.forEach((value, index) => {
            assert.strictEqual(JSON.stringify(evaled[index]), value);
        });
    });

    it('TestExpandTemplateWithEscapeCharacter', function () {
        const templates = preloaded.EscapeCharacter;
        let evaled = templates.expandTemplate('wPhrase');
        assert.strictEqual(evaled[0], 'Hi \r\n\t\\');

        evaled = templates.expandTemplate('AtEscapeChar');
        assert.strictEqual(evaled[0], 'Hi{1+1}[wPhrase]{wPhrase()}${wPhrase()}2${1+1}');

        evaled = templates.expandTemplate('otherEscape');
        assert.strictEqual(evaled[0], 'Hi \\y \\');

        evaled = templates.expandTemplate('escapeInExpression');
        assert.strictEqual(evaled[0], 'Hi hello\\\\');

        evaled = templates.expandTemplate('escapeInExpression2');
        assert.strictEqual(evaled[0], "Hi hello'");

        evaled = templates.expandTemplate('escapeInExpression3');
        assert.strictEqual(evaled[0], 'Hi hello"');

        evaled = templates.expandTemplate('escapeInExpression4');
        assert.strictEqual(evaled[0], 'Hi hello"');

        evaled = templates.expandTemplate('escapeInExpression5');
        assert.strictEqual(evaled[0], 'Hi hello\n');

        evaled = templates.expandTemplate('escapeInExpression6');
        assert.strictEqual(evaled[0], 'Hi hello\n');

        const todos = ['A', 'B', 'C'];
        evaled = templates.expandTemplate('showTodo', { todos });
        assert.strictEqual(
            evaled[0].toString().replace(/\r\n/g, '\n'),
            '\n    Your most recent 3 tasks are\n    * A\n* B\n* C\n    '
        );

        evaled = templates.expandTemplate('showTodo');
        assert.strictEqual(
            evaled[0].toString().replace(/\r\n/g, '\n'),
            '\n    You don\'t have any "t\\\\odo\'".\n    '
        );

        evaled = templates.expandTemplate('getUserName');
        assert.strictEqual(evaled[0], 'super "x man"');

        evaled = templates.expandTemplate('structure1');
        assert.strictEqual(JSON.stringify(evaled[0]), '{"lgType":"struct","list":["a","b|c"]}');

        evaled = templates.expandTemplate('dollarsymbol');
        assert.strictEqual(evaled[0], "$ $ ${'hi'} hi");
    });

    it('TestExpandTemplateWithEmptyListInStructuredLG', function () {
        const templates = preloaded.Expand;
        const data = {
            Data: {
                Name: 'NAME',
                Address: 'ADDRESS',
            },
        };

        const name = 'PointOfInterestSuggestedActionName';
        const evaled = templates.expandTemplate(name, data);

        assert.strictEqual(evaled[0]['text'], 'NAME at ADDRESS');
        assert.strictEqual(evaled[0]['speak'], 'NAME at ADDRESS');
        assert.strictEqual(evaled[0]['attachments'].length, 0);
        assert.strictEqual(evaled[0]['attachmentlayout'], 'list');
        assert.strictEqual(evaled[0]['inputhint'], 'ignoringInput');
    });

    it('TestExpandTemplateWithStrictMode', function () {
        let templates = preloaded.StrictModeFalse;

        const evaled = templates.expandTemplate('StrictFalse');
        assert.strictEqual(evaled[0], undefined);

        templates = preloaded.StrictModeTrue;
        assert.throws(
            () => templates.expandTemplate('StrictTrue'),
            (err) => {
                assert(
                    err.message.includes(
                        "'variable_not_defined' evaluated to null. [StrictTrue]  Error occurred when evaluating '-${variable_not_defined}'"
                    )
                );
                return true;
            }
        );
    });

    it('TestInlineEvaluate', function () {
        const templates = preloaded.two;
        let evaled = templates.evaluateText('hello');
        assert.strictEqual('hello', evaled);

        evaled = templates.evaluateText('');
        assert.strictEqual('', evaled);

        evaled = templates.evaluateText('${wPhrase()}');
        const options = ['Hi', 'Hello', 'Hiya'];
        assert(options.includes(evaled));
        assert.throws(
            () => templates.evaluateText('${ErrrorTemplate()}'),
            (err) => {
                assert(err.message.includes("it's not a built-in function or a custom function"));
                return true;
            }
        );
    });

    it('TestEvalExpression', function () {
        const templates = preloaded.EvalExpression;
        const userName = 'MS';
        let evaled = templates.evaluate('template1', { userName });
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template2', { userName });
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template3', { userName });
        assert.strictEqual(evaled, 'HiMS', `Evaled is ${evaled}`);

        const options1 = ['\r\nHi MS\r\n', '\nHi MS\n'];
        evaled = templates.evaluate('template4', { userName });
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${evaled}`);

        const options2 = ['\r\nHiMS\r\n', '\nHiMS\n'];
        evaled = templates.evaluate('template5', { userName });
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${evaled}`);

        evaled = templates.evaluate('template6', { userName });
        assert.strictEqual(evaled, 'goodmorning', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template7');
        assert.strictEqual(evaled, '{"a":"hello"}', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template8');
        assert.strictEqual(evaled, '{"user":{"name":"Allen"}}', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template9', { value: { count: 13 } });
        assert.strictEqual(evaled, '{"ctx":{"count":13}}', `Evaled is ${evaled}`);

        evaled = templates.evaluate('template10');
        assert.strictEqual(evaled, 13, `Evaled is ${evaled}`);

        evaled = templates.evaluate('template11');
        assert.strictEqual(evaled, 18, `Evaled is ${evaled}`);
    });

    it('TestRecursiveTemplate', function () {
        const templates = preloaded.RecursiveTemplate;
        let evaled = templates.evaluate('RecursiveAccumulate', { number: 10 });
        assert.strictEqual(evaled, 55);

        evaled = templates.evaluate('RecursiveFactorial', { number: 5 });
        assert.strictEqual(evaled, 1 * 2 * 3 * 4 * 5);

        evaled = templates.evaluate('RecursiveFibonacciSequence', { number: 5 });
        assert.strictEqual(evaled, 5);
    });

    it('TestProperties', function () {
        const templates = preloaded.two;
        assert.strictEqual(templates.toArray()[0].properties, undefined);

        const structuredTemplates = preloaded.StructuredTemplate;
        assert.strictEqual(structuredTemplates.toArray()[0].properties.Text, '${GetAge()}');
        assert.strictEqual(structuredTemplates.toArray()[0].properties.Speak, '${GetAge()}');
        assert.strictEqual(structuredTemplates.toArray()[0].properties['$type'], 'Activity');
    });

    it('TemplateCRUD_Normal', function () {
        const filePath = GetExampleFilePath('CrudInit.lg');
        const resource = new LGResource(filePath, filePath, fs.readFileSync(filePath, 'utf-8'));
        const templates = Templates.parseResource(resource);

        assert.strictEqual(templates.toArray().length, 2);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        assert.strictEqual(templates.toArray()[0].name, 'template1');
        assert.strictEqual(templates.toArray()[0].sourceRange.range.start.line, 3);
        assert.strictEqual(templates.toArray()[0].sourceRange.range.end.line, 8);
        assert.strictEqual(templates.toArray()[1].name, 'template2');
        assert.strictEqual(templates.toArray()[1].sourceRange.range.start.line, 9);
        assert.strictEqual(templates.toArray()[1].sourceRange.range.end.line, 12);

        // Add template
        templates.addTemplate('newtemplate', ['age', 'name'], '- hi ');
        assert.strictEqual(templates.toArray().length, 3);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        let newTemplate = templates.toArray()[2];
        assert.strictEqual(newTemplate.name, 'newtemplate');
        assert.strictEqual(newTemplate.parameters.length, 2);
        assert.strictEqual(newTemplate.parameters[0], 'age');
        assert.strictEqual(newTemplate.parameters[1], 'name');
        assert.strictEqual(newTemplate.body, '- hi ');
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 14);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 15);

        // Add another template
        templates.addTemplate('newtemplate2', undefined, '- hi2 ');
        assert.strictEqual(templates.toArray().length, 4);
        assert.strictEqual(templates.diagnostics.length, 0);
        newTemplate = templates.toArray()[3];
        assert.strictEqual(newTemplate.name, 'newtemplate2');
        assert.strictEqual(newTemplate.parameters.length, 0);
        assert.strictEqual(newTemplate.body, '- hi2 ');
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 16);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 17);

        // update a middle template
        templates.updateTemplate('newtemplate', 'newtemplateName', ['newage', 'newname'], '- new hi\r\n#hi');
        assert.strictEqual(templates.toArray().length, 4);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        newTemplate = templates.toArray()[2];
        assert.strictEqual(newTemplate.name, 'newtemplateName');
        assert.strictEqual(newTemplate.parameters.length, 2);
        assert.strictEqual(newTemplate.parameters[0], 'newage');
        assert.strictEqual(newTemplate.parameters[1], 'newname');
        assert.strictEqual(newTemplate.body.replace(/\r\n/g, '\n'), '- new hi\n- #hi');
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 14);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 16);
        assert.strictEqual(templates.toArray()[3].sourceRange.range.start.line, 17);
        assert.strictEqual(templates.toArray()[3].sourceRange.range.end.line, 18);

        // update the tailing template
        templates.updateTemplate(
            'newtemplate2',
            'newtemplateName2',
            ['newtemplate2', 'newtemplateName2'],
            '- new hi\r\n#hi2\r\n'
        );
        assert.strictEqual(templates.toArray().length, 4);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        newTemplate = templates.toArray()[3];
        assert.strictEqual(newTemplate.name, 'newtemplateName2');
        assert.strictEqual(newTemplate.parameters.length, 2);
        assert.strictEqual(newTemplate.body.replace(/\r\n/g, '\n'), '- new hi\n- #hi2\n');
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 17);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 20);

        // delete a middle template
        templates.deleteTemplate('newtemplateName');
        assert.strictEqual(templates.toArray().length, 3);
        assert.strictEqual(templates.diagnostics.length, 0);
        newTemplate = templates.toArray()[2];
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 14);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 17);

        // delete a tailing template
        templates.deleteTemplate('newtemplateName2');
        assert.strictEqual(templates.toArray().length, 2);
        assert.strictEqual(templates.diagnostics.length, 0);
        newTemplate = templates.toArray()[1];
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 9);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 13);
    });

    it('TemplateCRUD_RepeatAdd', function () {
        const filePath = GetExampleFilePath('CrudInit.lg');
        const resource = new LGResource(filePath, filePath, fs.readFileSync(filePath, 'utf-8'));
        const templates = Templates.parseResource(resource);

        // Add template
        templates.addTemplate('newtemplate', ['age', 'name'], '- hi ');
        assert.strictEqual(templates.toArray().length, 3);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        let newTemplate = templates.toArray()[2];
        assert.strictEqual(newTemplate.name, 'newtemplate');
        assert.strictEqual(newTemplate.parameters.length, 2);
        assert.strictEqual(newTemplate.parameters[0], 'age');
        assert.strictEqual(newTemplate.parameters[1], 'name');
        assert.strictEqual(newTemplate.body, '- hi ');
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 14);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 15);

        // Add another template
        templates.addTemplate('newtemplate2', undefined, '- hi2 ');
        assert.strictEqual(templates.toArray().length, 4);
        assert.strictEqual(templates.diagnostics.length, 0);
        newTemplate = templates.toArray()[3];
        assert.strictEqual(newTemplate.name, 'newtemplate2');
        assert.strictEqual(newTemplate.parameters.length, 0);
        assert.strictEqual(newTemplate.body, '- hi2 ');
        assert.strictEqual(newTemplate.sourceRange.range.start.line, 16);
        assert.strictEqual(newTemplate.sourceRange.range.end.line, 17);

        // add an exist template
        assert.throws(
            () => templates.addTemplate('newtemplate', undefined, '- hi2 '),
            new Error(TemplateErrors.templateExist('newtemplate'))
        );
    });

    it('TemplateCRUD_RepeatDelete', function () {
        const filePath = GetExampleFilePath('CrudInit.lg');
        const resource = new LGResource(filePath, filePath, fs.readFileSync(filePath, 'utf-8'));
        const templates = Templates.parseResource(resource);

        // Delete template
        templates.deleteTemplate('template1');
        assert.strictEqual(templates.toArray().length, 1);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        assert.strictEqual(templates.toArray()[0].name, 'template2');
        assert.strictEqual(templates.toArray()[0].sourceRange.range.start.line, 3);
        assert.strictEqual(templates.toArray()[0].sourceRange.range.end.line, 6);

        // Delete a template that does not exist
        templates.deleteTemplate('xxx');
        assert.strictEqual(templates.toArray().length, 1);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 0);
        assert.strictEqual(templates.toArray()[0].name, 'template2');
        assert.strictEqual(templates.toArray()[0].sourceRange.range.start.line, 3);
        assert.strictEqual(templates.toArray()[0].sourceRange.range.end.line, 6);

        // Delete all template
        templates.deleteTemplate('template2');
        assert.strictEqual(templates.toArray().length, 0);
        assert.strictEqual(templates.imports.length, 0);
        assert.strictEqual(templates.diagnostics.length, 1);
        assert.strictEqual(templates.diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert.strictEqual(templates.diagnostics[0].message, TemplateErrors.noTemplate);
    });

    it('TemplateCRUD_Diagnostic', function () {
        const filePath = GetExampleFilePath('CrudInit.lg');
        const resource = new LGResource(filePath, filePath, fs.readFileSync(filePath, 'utf-8'));
        const templates = Templates.parseResource(resource);

        // add error template name (error in template)
        templates.addTemplate('newtemplate#$%', ['age', 'name'], '- hi ');
        assert.strictEqual(templates.diagnostics.length, 1);
        let diagnostic = templates.diagnostics[0];
        assert.strictEqual(diagnostic.message, TemplateErrors.invalidTemplateName('newtemplate#$%'));
        assert.strictEqual(diagnostic.range.start.line, 14);
        assert.strictEqual(diagnostic.range.end.line, 14);

        // replace the error template with right template
        templates.updateTemplate('newtemplate#$%', 'newtemplateName', undefined, '- new hi');
        assert.strictEqual(templates.diagnostics.length, 0);

        // reference the other exist template
        templates.updateTemplate('newtemplateName', 'newtemplateName', undefined, '- ${template1()}');
        assert.strictEqual(templates.diagnostics.length, 0);

        // wrong reference, throw by static checker
        templates.updateTemplate('newtemplateName', 'newtemplateName', undefined, '- ${NoTemplate()}');
        assert.strictEqual(templates.diagnostics.length, 1);
        diagnostic = templates.diagnostics[0];
        assert(diagnostic.message.includes("it's not a built-in function or a custom function"));
        assert.strictEqual(diagnostic.range.start.line, 15);
        assert.strictEqual(diagnostic.range.end.line, 15);

        // delete error message
        templates.deleteTemplate('newtemplateName');
        assert.strictEqual(templates.diagnostics.length, 0);
    });

    it('TemplateUpdate_With_Trailing_Newline', function () {
        const filePath = GetExampleFilePath('CrudInit.lg');
        const resource = new LGResource(filePath, filePath, fs.readFileSync(filePath, 'utf-8'));
        let templates = Templates.parseResource(resource);

        templates = templates.updateTemplate('template1', 'template1', undefined, '-Hi\r\n-Hello\r\n');
        let firstTemplateRange = templates.toArray()[0].sourceRange.range;
        assert.strictEqual(firstTemplateRange.start.line, 3);
        assert.strictEqual(firstTemplateRange.end.line, 6);

        let secondTemplateRange = templates.toArray()[1].sourceRange.range;
        assert.strictEqual(secondTemplateRange.start.line, 7);
        assert.strictEqual(secondTemplateRange.end.line, 10);

        templates = templates.updateTemplate('template2', 'template2', undefined, '-Hi');
        firstTemplateRange = templates.toArray()[0].sourceRange.range;
        assert.strictEqual(firstTemplateRange.start.line, 3);
        assert.strictEqual(firstTemplateRange.end.line, 6);

        secondTemplateRange = templates.toArray()[1].sourceRange.range;
        assert.strictEqual(secondTemplateRange.start.line, 7);
        assert.strictEqual(secondTemplateRange.end.line, 8);
    });

    it('TestMemoryScope', function () {
        const templates = preloaded.MemoryScope;
        let evaled = templates.evaluate('T1', { turn: { name: 'Dong', count: 3 } });
        assert.strictEqual(
            evaled,
            'Hi Dong, welcome to Seattle, Seattle is a beautiful place, how many burgers do you want, 3?'
        );

        const objscope = {
            schema: {
                Bread: {
                    enum: ['A', 'B'],
                },
            },
        };
        const scope = new SimpleObjectMemory(objscope);

        evaled = templates.evaluate('AskBread', scope);
        assert.strictEqual(evaled, 'Which Bread, A or B do you want?');
    });

    it('TestStructuredTemplate', function () {
        const templates = preloaded.StructuredTemplate;

        let evaled = templates.evaluate('AskForAge.prompt');
        assert.equal(evaled.text, evaled.speak);

        evaled = templates.evaluate('AskForAge.prompt2');
        if (evaled.text.includes('how old')) {
            assert.deepStrictEqual(
                evaled,
                JSON.parse('{"lgType":"Activity","text":"how old are you?","suggestedactions":["10","20","30"]}')
            );
        } else {
            assert.deepStrictEqual(
                evaled,
                JSON.parse('{"lgType":"Activity","text":"what\'s your age?","suggestedactions":["10","20","30"]}')
            );
        }

        evaled = templates.evaluate('AskForAge.prompt3');
        assert.deepStrictEqual(
            evaled,
            JSON.parse('{"lgType":"Activity","text":"${GetAge()}","suggestions":["10 | cards","20 | cards"]}')
        );

        evaled = templates.evaluate('T1');
        assert.deepStrictEqual(
            evaled,
            JSON.parse('{"lgType":"Activity","text":"This is awesome","speak":"hello world I can also speak!"}')
        );

        evaled = templates.evaluate('ST1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"cool","speak":"beta"}'));

        evaled = templates.evaluate('AskForColor');
        assert.deepStrictEqual(
            evaled,
            JSON.parse(
                '{"lgType":"Activity","suggestedactions":[{"lgType":"MyStruct","speak":"beta","text":"food"},{"lgType":"Activity","speak":"I can also speak!"}]}'
            )
        );

        evaled = templates.evaluate('MultiExpression');
        assert.strictEqual(
            evaled,
            '{"lgType":"Activity","speak":"I can also speak!"} {"lgType":"MyStruct","text":"hi"}'
        );

        evaled = templates.evaluate('StructuredTemplateRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"hi"}'));

        evaled = templates.evaluate('MultiStructuredRef');
        assert.deepStrictEqual(
            evaled,
            JSON.parse(
                '{"lgType":"MyStruct","list":[{"lgType":"SubStruct","text":"hello"},{"lgType":"SubStruct","text":"world"}]}'
            )
        );

        evaled = templates.evaluate('templateWithSquareBrackets', { manufacturer: { Name: 'Acme Co' } });
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Struct","text":"Acme Co"}'));

        evaled = templates.evaluate('ValueWithEqualsMark', { name: 'Jack' });
        assert.deepStrictEqual(
            evaled,
            JSON.parse('{"lgType":"Activity","text":"Hello! welcome back. I have your name = Jack"}')
        );
    });

    it('TestTemplateCache', function () {
        const templates = preloaded.TemplateCache;

        // Default cache policy
        let evaled = templates.evaluate('templateWithSameParams', { param: 'ms' });
        let resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);

        // with None cache override
        // Notice, the expression is ${rand(1, 10000000)}, there still exist the probability of test failure
        const noneCacheOptions = new EvaluationOptions();
        noneCacheOptions.cacheScope = LGCacheScope.None;
        evaled = templates.evaluate('templateWithSameParams', { param: 'ms' }, noneCacheOptions);
        resultList = evaled.split(' ');
        assert.notStrictEqual(resultList[0], resultList[1]);

        // with different parameters
        evaled = templates.evaluate('templateWithDifferentParams', { param1: 'ms', param2: 'newms' });
        resultList = evaled.split(' ');
        assert.notStrictEqual(resultList[0], resultList[1]);

        // with None cache override
        evaled = templates.evaluate('templateWithDifferentParams', { param1: 'ms', param2: 'newms' }, noneCacheOptions);
        resultList = evaled.split(' ');
        assert.notStrictEqual(resultList[0], resultList[1]);

        // nested template test, with default cache policy
        evaled = templates.evaluate('nestedTemplate', { param1: 'ms' });
        resultList = evaled.split(' ');
        assert.notStrictEqual(resultList[0], resultList[1]);

        // with Global cache override
        const globalCacheOptions = new EvaluationOptions();
        globalCacheOptions.cacheScope = LGCacheScope.Global;
        evaled = templates.evaluate('nestedTemplate', { param1: 'ms' }, globalCacheOptions);
        resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);
    });

    it('TestCacheScopeOption', function () {
        //Global cache test
        let evaled = preloaded.GlobalCache.evaluate('nestedTemplate', { param: 'ms' });
        let resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);

        // Global cache effects one evaluation life cycle
        const evaled2 = preloaded.GlobalCache.evaluate('nestedTemplate', { param: 'ms' });
        assert.notStrictEqual(evaled, evaled2);

        // Global cache import none cache, the entrance option would override the options in children
        evaled = preloaded.GlobalCache_1.evaluate('nestedTemplate', { param: 'ms' });
        resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);

        // locale cache test
        evaled = preloaded.LocalCache.evaluate('templateWithSameParams', { param: 'ms' });
        resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);

        // default cache test
        evaled = preloaded.DefaultCache.evaluate('templateWithSameParams', { param: 'ms' });
        resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);

        // None cache.
        // Notice, the expression is ${rand(1, 10000000)}, there still exist the probability of test failure
        evaled = preloaded.DefaultCache.evaluate('nestedTemplate', { param: 'ms' });
        resultList = evaled.split(' ');
        assert.notStrictEqual(resultList[0], resultList[1]);

        // api override options in LG file
        // use global cache to override the none cache.
        const globalCacheOptions = new EvaluationOptions();
        globalCacheOptions.cacheScope = LGCacheScope.Global;
        evaled = preloaded.NoneCache.evaluate('nestedTemplate', { param: 'ms' }, globalCacheOptions);
        resultList = evaled.split(' ');
        assert.strictEqual(resultList[0], resultList[1]);
    });

    it('TestConditionExpression', function () {
        const templates = preloaded.ConditionExpression;

        let evaled = templates.evaluate('conditionTemplate', { num: 1 });
        assert.strictEqual(evaled, 'Your input is one');

        evaled = templates.evaluate('conditionTemplate', { num: 2 });
        assert.strictEqual(evaled, 'Your input is two');

        evaled = templates.evaluate('conditionTemplate', { num: 3 });
        assert.strictEqual(evaled, 'Your input is three');

        evaled = templates.evaluate('conditionTemplate', { num: 4 });
        assert.strictEqual(evaled, 'Your input is not one, two or three');
    });

    it('TestExpandTemplateWithStructuredLG', function () {
        const templates = preloaded.StructuredTemplate;

        let evaled = templates.expandTemplate('AskForAge.prompt');
        assert.strictEqual(evaled.length, 4, `Evaled is ${evaled}`);

        let expectedResults = [
            '{"lgType":"Activity","text":"how old are you?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"how old are you?","speak":"what\'s your age?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"what\'s your age?"}',
        ];

        expectedResults.forEach((value, index) => {
            assert.strictEqual(JSON.stringify(evaled[index]), JSON.stringify(JSON.parse(value)));
        });

        evaled = templates.expandTemplate('ExpanderT1');
        assert.strictEqual(evaled.length, 4, `Evaled is ${evaled}`);

        expectedResults = [
            '{"lgType":"MyStruct","text":"Hi","speak":"how old are you?"}',
            '{"lgType":"MyStruct","text":"Hello","speak":"how old are you?"}',
            '{"lgType":"MyStruct","text":"Hi","speak":"what\'s your age?"}',
            '{"lgType":"MyStruct","text":"Hello","speak":"what\'s your age?"}',
        ];

        expectedResults.forEach((value, index) => {
            assert.strictEqual(JSON.stringify(evaled[index]), JSON.stringify(JSON.parse(value)));
        });
    });

    it('TestExpressionextract', function () {
        const templates = preloaded.ExpressionExtract;

        let evaled1 = templates.evaluate('templateWithBrackets');
        let evaled2 = templates.evaluate('templateWithBrackets2');
        let evaled3 = templates.evaluate('templateWithBrackets3').toString().trim();
        let espectedResult = "don't mix {} and '{}'";
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = templates.evaluate('templateWithQuotationMarks');
        evaled2 = templates.evaluate('templateWithQuotationMarks2');
        evaled3 = templates.evaluate('templateWithQuotationMarks3').toString().trim();
        espectedResult = 'don\'t mix {"} and ""\'"';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = templates.evaluate('templateWithUnpairedBrackets1');
        evaled2 = templates.evaluate('templateWithUnpairedBrackets12');
        evaled3 = templates.evaluate('templateWithUnpairedBrackets13').toString().trim();
        espectedResult = '{prefix 5 sufix';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = templates.evaluate('templateWithUnpairedBrackets2');
        evaled2 = templates.evaluate('templateWithUnpairedBrackets22');
        evaled3 = templates.evaluate('templateWithUnpairedBrackets23').toString().trim();
        espectedResult = 'prefix 5 sufix}';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
    });

    it('TestEmptyArrayAndObject', function () {
        const templates = preloaded.EmptyArrayAndObject;

        let evaled = templates.evaluate('template', { list: [], obj: {} });
        assert.strictEqual(evaled, 'list and obj are both empty');

        evaled = templates.evaluate('template', { list: [], obj: new Map() });
        assert.strictEqual(evaled, 'list and obj are both empty');

        evaled = templates.evaluate('template', { list: ['hi'], obj: {} });
        assert.strictEqual(evaled, 'obj is empty');

        evaled = templates.evaluate('template', { list: [], obj: { a: 'a' } });
        assert.strictEqual(evaled, 'list is empty');

        const map = new Map();
        map.set('a', 'a');
        evaled = templates.evaluate('template', { list: [], obj: map });
        assert.strictEqual(evaled, 'list is empty');

        evaled = templates.evaluate('template', { list: [{}], obj: { a: 'a' } });
        assert.strictEqual(evaled, 'list and obj are both not empty.');
    });

    it('TestLGOptions', function () {
        //LGOptionTest has no import files.
        const templates = preloaded.LGOptionsTest;

        let evaled = templates.evaluate('SayHello');
        assert.strictEqual('hi The user.name is undefined', evaled);

        evaled = templates.evaluate('testInlineString');
        assert.strictEqual(evaled.replace(/\r\n/g, '\n'), 'm\n\ns\n\nf\n\nt\n\n');

        //a1.lg imports b1.lg.
        //a1's option is strictMode is false, replaceNull = ${path} is undefined, and defalut lineBreakStyle.
        //b1's option is strictMode is true, replaceNull = The ${path} is undefined, and markdown lineBreakStyle.
        const templates2 = preloaded.a1;

        const evaled2 = templates2.evaluate('SayHello');

        assert.strictEqual('hi user.name is undefined', evaled2);
        assert.strictEqual(templates2.lgOptions.LineBreakStyle, LGLineBreakStyle.Default);

        //a2.lg imports b2.lg and c2.lg.
        //a2.lg: replaceNull = The ${path} is undefined
        //b2.lg: strict = true, replaceNull = ${path} is evaluated to null, please check!
        //c2: lineBreakStyle = markdown
        const templates3 = preloaded.a2;

        const evaled3 = templates3.evaluate('SayHello');

        assert.strictEqual(evaled3, 'hi The user.name is undefined');

        assert.strictEqual(templates3.lgOptions.LineBreakStyle, undefined);

        //a3.lg imports b3.lg and c3.lg in sequence.
        //b3.lg imports d3.lg
        //a3.lg: lineBreakStyle = markdown, replaceNull = the ${path} is undefined a3!
        //b3.lg: lineBreakStyle = default
        //d3: replaceNull = ${path} is evaluated to null in d3!
        //c3: replaceNull = ${path} is evaluated to null in c3!
        const templates4 = preloaded.a3;

        let evaled4 = templates4.evaluate('SayHello');

        assert.strictEqual(evaled4, 'hi the user.name is undefined a3!');

        assert.strictEqual(templates4.lgOptions.LineBreakStyle, LGLineBreakStyle.Markdown);

        //Test use an defined option in Evaluate method, which will override all options in LG files.
        const optionStrList = [
            '@strictMode = false',
            '@replaceNull = ${ path } is undefined',
            '@lineBreakStyle = defalut',
        ];
        const newOpt = new EvaluationOptions(optionStrList);
        evaled4 = templates4.evaluate('SayHello', undefined, newOpt);

        assert.strictEqual(evaled4, 'hi user.name is undefined');

        evaled4 = templates4.evaluate('testInlineString', undefined, newOpt);

        assert.strictEqual(evaled4.replace(/\r\n/g, '\n'), 'm\ns\nf\nt\n');

        //a4.lg imports b4.lg and c4.lg in sequence.
        //b4.lg imports d3.lg, c4.lg imports f4.lg.
        //a4.lg: replaceNull = the ${path} is undefined a4!.
        //b4.lg, c4.lg: nothing but import statement.
        //d4: only have template definition.
        //f4: only options, strictMode = true, replaceNull = The ${path} is undefined, lineBreaStyle = markdown.
        const templates5 = preloaded.a4;

        const evaled5 = templates5.evaluate('SayHello');

        assert.strictEqual(evaled5, 'hi the user.name is undefined a4!');

        assert.strictEqual(templates5.lgOptions.StrictMode, undefined);

        assert.strictEqual(templates5.lgOptions.LineBreakStyle, undefined);
    });

    it('TestNullTolerant', function () {
        const templates = preloaded.NullTolerant;

        let evaled = templates.evaluate('template1');
        assert.strictEqual(evaled, undefined);

        evaled = templates.evaluate('template2');
        assert.strictEqual(evaled, 'result is undefined');

        const jObjEvaled = templates.evaluate('template3');
        assert.strictEqual(jObjEvaled['key1'], undefined);

        evaled = templates.evaluate('template5');
        assert.strictEqual(evaled, 'hello');

        evaled = templates.evaluate('template6');
        assert.strictEqual(evaled, null);
    });

    it('TestIsTemplateFunction', function () {
        const templates = preloaded.IsTemplate;

        let evaled = templates.evaluate('template2', { templateName: 'template1' });
        assert.strictEqual(evaled, 'template template1 exists');

        evaled = templates.evaluate('template2', { templateName: 'wPhrase' });
        assert.strictEqual(evaled, 'template wPhrase exists');

        evaled = templates.evaluate('template2', { templateName: 'xxx' });
        assert.strictEqual(evaled, 'template xxx does not exist');
    });

    it('TestStringInterpolation', function () {
        const templates = preloaded.StringInterpolation;

        let evaled = templates.evaluate('simpleStringTemplate');
        assert.strictEqual(evaled, 'say hi');

        evaled = templates.evaluate('StringTemplateWithVariable', { w: 'world' });
        assert.strictEqual(evaled, 'hello world');

        evaled = templates.evaluate('StringTemplateWithMixing', { name: 'jack' });
        assert.strictEqual(evaled, 'I know your name is jack');

        evaled = templates.evaluate('StringTemplateWithJson', { h: 'hello', w: 'world' });
        assert.strictEqual(evaled, "get 'h' value : hello");

        evaled = templates.evaluate('StringTemplateWithEscape');
        assert.strictEqual(evaled, 'just want to output ${bala`bala}');

        evaled = templates.evaluate('StringTemplateWithTemplateRef');
        assert.strictEqual(evaled, 'hello jack , welcome. nice weather!');

        evaled = templates.evaluate('StringTemplateWithPureObjectDefinition', { item: 'item1' });
        assert.deepStrictEqual(evaled, { text: 'I would like item1 today' });

        evaled = templates.evaluate('StringTemplateWithObjectDefinition', { item: 'item1' });
        assert.strictEqual(evaled, "get 'text' value : I would like item1 today");

        evaled = templates.evaluate('StringTemplateWithPureArrayDefinition', { item: 'item1' });
        assert.deepStrictEqual(evaled, ['I would like item1 today']);

        evaled = templates.evaluate('StringTemplateWithArrayDefinition', { item: 'item1' });
        assert.strictEqual(evaled, 'get first value : I would like item1 today');

        evaled = templates.evaluate('StringTemplateWithNestedDefinition', { item1: 'item1', item2: 'item2' });
        assert.strictEqual(evaled, 'two values: I would like item1 today, I would like item2 today');
    });

    it('TestMemoryAccessPath', function () {
        const templates = preloaded.MemoryAccess;

        const scope = {
            myProperty: {
                name: 'p1',
            },
            turn: {
                properties: {
                    p1: {
                        enum: 'p1enum',
                    },
                },
            },
        };

        // this evaulate will hit memory access twice
        // first for "property", and get "p1", from local
        // sencond for "turn.property[p1].enum" and get "p1enum" from global
        let evaled = templates.evaluate('T1', scope);
        assert.strictEqual(evaled, 'p1enum');

        // this evaulate will hit memory access twice
        // first for "myProperty.name", and get "p1", from global
        // sencond for "turn.property[p1].enum" and get "p1enum" from global
        evaled = templates.evaluate('T3', scope);
        assert.strictEqual(evaled, 'p1enum');
    });

    it('TestReExecute', function () {
        const templates = preloaded.ReExecute;

        // may be has different values
        const evaled = templates.evaluate('templateWithSameParams', { param1: 'ms', param2: 'newms' });

        // the third one should be the same with the first one
        const resultList = evaled.split(' ');
        assert(resultList.length, 3);

        assert(resultList[0], resultList[2]);
    });

    it('TestCustomFunction', function () {
        this.timeout(5000); // We can't preload the template, so need increased timeout
        const parser = new ExpressionParser((func) => {
            if (func === 'custom') {
                return new NumericEvaluator('custom', (args) => {
                    return args[0] + args[1];
                });
            } else {
                return Expression.lookup(func);
            }
        });
        const templates = Templates.parseFile(GetExampleFilePath('CustomFunction.lg'), undefined, parser);
        assert.strictEqual(templates.expressionParser, parser);
        let result = templates.evaluate('template', {});
        assert.strictEqual(result, 3);
        result = templates.evaluate('callSub', {});
        assert.strictEqual(result, 12);
    });

    it('TestCustomFunction2', function () {
        this.timeout(5000); // We can't preload the template, so need increased timeout
        Expression.functions.add('contoso.sqrt', (args) => {
            let result = null;
            if (args[0] !== undefined) {
                const inputFloat = parseFloat(args[0]);
                result = Math.sqrt(inputFloat);
            }

            return result;
        });

        const templates = Templates.parseFile(GetExampleFilePath('CustomFunction2.lg'), undefined);
        const evaled = templates.evaluate('custom', {});
        assert.strictEqual(evaled, 6.0);
    });

    it('TestInjectLG', function () {
        let { value: evaled, error } = Expression.parse('general.greeting()').tryEvaluate({ name: 'Alice' });
        assert.strictEqual(evaled.toString(), 'hi Alice');

        let memory1 = new StackedMemory();
        memory1.push(new SimpleObjectMemory({ name: 'Alice' }));
        memory1.push(new CustomizedMemory({ name: 'Bob' }));

        ({ value: evaled, error } = Expression.parse('general.greeting()').tryEvaluate(memory1));
        assert.strictEqual(evaled.toString(), 'hi Bob');

        ({ value: evaled, error } = Expression.parse('general.yolo(8,7)').tryEvaluate({ name: 'Alice' }));
        assert.strictEqual(evaled.toString(), 'Alice have 15 cookies!');

        memory1 = new StackedMemory();
        memory1.push(new SimpleObjectMemory({ name: 'Alice' }));
        memory1.push(new CustomizedMemory({ name: 'Bob' }));
        ({ value: evaled, error } = Expression.parse('general.yolo(12, 12)').tryEvaluate(memory1));
        assert.strictEqual(evaled.toString(), 'Bob have 24 cookies!');

        ({ value: evaled, error } = Expression.parse('general.addTwoNum(5,6)').tryEvaluate({ a: 3, b: 1 }));
        assert.strictEqual(evaled.toString(), '11');

        ({ value: evaled, error } = Expression.parse('general.sumAll()').tryEvaluate());
        assert.strictEqual(evaled, 3);

        ({ value: evaled, error } = Expression.parse('general.cool(2)').tryEvaluate());
        assert.strictEqual(evaled, 3);

        ({ value: evaled, error } = Expression.parse('common.looking()').tryEvaluate());
        assert.strictEqual(evaled, 'John');

        const scope1 = { a: ['cat', 'dog'], b: 12.1, c: ['lion'] };
        ({ value: evaled, error } = Expression.parse('common.countTotal(a, c)').tryEvaluate(scope1));
        assert.strictEqual(error, undefined);
        assert.strictEqual(evaled, 3);

        ({ value: evaled, error } = Expression.parse('common.countTotal()').tryEvaluate(scope1));
        assert.strictEqual(
            error,
            "list1 is not a list or array. [countTotal]  Error occurred when evaluating '-${count(union(list1,list2))}'."
        );

        ({ value: evaled, error } = Expression.parse('common.countTotal(a, b, c)').tryEvaluate(scope1));
        assert.strictEqual(
            error,
            "list2 is not a list or array. [countTotal]  Error occurred when evaluating '-${count(union(list1,list2))}'."
        );

        const scope2 = { i: 1, j: 2, k: 3, l: 4 };
        ({ value: evaled, error } = Expression.parse('common.sumFourNumbers(i, j, k, l)').tryEvaluate(scope2));
        assert.strictEqual(evaled, 10);
    });

    it('TestInjectLGWithoutNamespace', function () {
        const lgPath = GetExampleFilePath('./injectionTest/injectWithoutNamespace.lg');
        let resource = new LGResource('myId', lgPath, fs.readFileSync(lgPath, 'utf-8'));
        Templates.parseResource(resource);

        let { value: evaled, error } = Expression.parse('myId.greeting()').tryEvaluate({ name: 'Alice' });
        assert(error === undefined);
        assert.strictEqual(evaled, 'hi Alice');

        // using the fuileName parsed from Id as the namespace
        resource = new LGResource('./path/myNewId.lg', lgPath, fs.readFileSync(lgPath, 'utf-8'));
        Templates.parseResource(resource);

        ({ value: evaled, error } = Expression.parse('myNewId.greeting()').tryEvaluate({ name: 'Alice' }));
        assert(error === undefined);
        assert.strictEqual(evaled, 'hi Alice');

        // With empty id
        resource = new LGResource('', lgPath, fs.readFileSync(lgPath, 'utf-8'));
        Templates.parseResource(resource);

        ({ value: evaled, error } = Expression.parse('greeting()').tryEvaluate({ name: 'Alice' }));
        assert(error === undefined);
        assert.strictEqual(evaled, 'hi Alice');
    });

    it('TestFileOperation', function () {
        Templates.enableFromFile = true;
        const templates = Templates.parseFile(GetExampleFilePath('FileOperation.lg'));
        let evaled = templates.evaluate('FromFileWithoutEvaluation');
        assert.strictEqual(evaled, 'hi ${name}');

        evaled = templates.evaluate('FromFileWithEvaluation1', { name: 'Lucy' });
        assert.strictEqual(evaled, 'hi Lucy');

        evaled = templates.evaluate('FromFileWithEvaluation2', { name: 'Lucy' });
        assert.strictEqual(evaled, 'hi Lucy');

        evaled = templates.evaluate('FromFileBinary');
        assert.strictEqual(evaled, 'hi ${name}');
    });

    it('TestFileOperationDisabled', function () {
        Templates.enableFromFile = false;
        const templates = Templates.parseFile(GetExampleFilePath('FileOperation.lg'));
        assert.throws(() => templates.evaluate('FromFileWithoutEvaluation'), { name: 'Error' });
    });

    it('TestImportAlias', function () {
        const templates = preloaded.Alias;

        // duplicated template name.
        let evaled = templates.evaluate('wPhrase');
        assert.strictEqual(evaled, 'hi');

        // import from AliasBase1.lg
        evaled = templates.evaluate('callWelcome1', { theName: 'Jack' });
        assert.strictEqual(evaled, 'hi Jack');

        // import from AliasBase1.lg
        evaled = templates.evaluate('callWelcome2', { theName: 'Jack' });
        assert.strictEqual(evaled, 'hello Jack');

        // static/all import
        evaled = templates.evaluate('callWelcome3', { theName: 'Jack' });
        assert.strictEqual(evaled, 'welcome Jack');

        // builtin function as the first place
        evaled = templates.evaluate('callLength');
        assert.strictEqual(evaled, 4);

        // import from AliasBase1.lg
        evaled = templates.evaluate('callBase1Length');
        assert.strictEqual(evaled, 'my length');

        // import from AliasBase2.lg
        evaled = templates.evaluate('callBase2Length');
        assert.strictEqual(evaled, 'my length2');

        // static/all import. (use lg as the prefix)
        evaled = templates.evaluate('callBase3Length');
        assert.strictEqual(evaled, 'my base length');

        ///////////inline evaluation//////////////////
        // call normal template in current lg file
        evaled = templates.evaluateText('${wPhrase()}');
        assert.strictEqual(evaled, 'hi');

        evaled = templates.evaluateText('${callBase1Length()}');
        assert.strictEqual(evaled, 'my length');

        // import from AliasBase1.lg
        evaled = templates.evaluateText('${base1.welcome()}', { name: 'Jack' });
        assert.strictEqual(evaled, 'hi Jack');

        // call builtin function
        evaled = templates.evaluateText("${length('hello')}");
        assert.strictEqual(evaled, 5);

        // call template length form import
        evaled = templates.evaluateText('${lg.length()}');
        assert.strictEqual(evaled, 'my base length');

        // call length template in AliasBase1.lg
        evaled = templates.evaluateText('${base1.length()}');
        assert.strictEqual(evaled, 'my length');
    });
});
