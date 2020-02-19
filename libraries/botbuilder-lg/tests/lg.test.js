const { TemplateEngine, LGParser } = require('../');
const { SimpleObjectMemory } = require('adaptive-expressions');
const assert = require('assert');
const fs = require('fs');

function GetExampleFilePath(fileName) {
    return `${ __dirname }/testData/examples/` + fileName;
}


describe('LG', function() {
    it('TestBasic', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('2.lg'));
        let evaled = engine.evaluateTemplate('wPhrase');
        const options = ['Hi', 'Hello', 'Hiya'];
        assert.strictEqual(options.includes(evaled), true, `The result ${ evaled } is not in those options [${ options.join(',') }]`);
    });

    it('TestBasicTemplateReference', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('3.lg'));
        let evaled = engine.evaluateTemplate('welcome-user', undefined);
        const options = ['Hi', 'Hello', 'Hiya', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert.strictEqual(options.includes(evaled), true, `The result ${ evaled } is not in those options [${ options.join(',') }]`);
    });

    it('TestBasicTemplateRefAndEntityRef', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('4.lg'));
        let userName = 'DL';
        let evaled = engine.evaluateTemplate('welcome-user', { userName: userName });
        const options = ['Hi', 'Hello', 'Hiya ', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert.strictEqual(evaled.includes(userName), true, `The result ${ evaled } does not contiain ${ userName }`);
    });

    it('TestBaicConditionalTemplate', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('5.lg'));

        let evaled = engine.evaluateTemplate('time-of-day-readout', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('time-of-day-readout', { timeOfDay: 'evening' });
        assert.strictEqual(evaled === 'Good evening' || evaled === 'Evening! ', true, `Evaled is ${ evaled }`);
    });

    it('TestBasicConditionalTemplateWithoutDefault', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('5.lg'));

        let evaled = engine.evaluateTemplate('time-of-day-readout-without-default', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('time-of-day-readout-without-default2', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('time-of-day-readout-without-default2', { timeOfDay: 'evening' });
        assert.strictEqual(evaled, undefined, `Evaled is ${ evaled } which should be undefined.`);
    });

    it('TestBasicTemplateRefWithParameters', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('6.lg'));

        let evaled = engine.evaluateTemplate('welcome', undefined);
        const options1 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = engine.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);
    });

    it('TestBasicSwitchCaseTemplate', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('switchcase.lg'));
        let evaled1 = engine.evaluateTemplate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1 === 'Happy Saturday!', true, `Evaled is ${ evaled1 }`);

        let evaled3 = engine.evaluateTemplate('greetInAWeek', { day: 'Monday' });
        assert.strictEqual(evaled3 === 'Work Hard!', true, `Evaled is ${ evaled3 }`);
    });

    it('TestBasicListSupport', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('BasicList.lg'));

        let evaled = engine.evaluateTemplate('BasicJoin', { items: ['1'] });
        assert.strictEqual(evaled, '1', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('BasicJoin', { items: ['1', '2'] });
        assert.strictEqual(evaled, '1, 2', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('BasicJoin', { items: ['1', '2', '3'] });
        assert.strictEqual(evaled, '1, 2 and 3', `Evaled is ${ evaled }`);
    });

    it('TestBasicExtendedFunctions', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('6.lg'));
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow'
            },
            {
                time: '8 pm',
                date: 'tomorrow'
            }
        ];

        let evaled = engine.evaluateTemplate('ShowAlarmsWithForeach', { alarms: alarms });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('ShowAlarmsWithLgTemplate', { alarms: alarms });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('ShowAlarmsWithDynamicLgTemplate', { alarms: alarms, templateName: 'ShowAlarm' });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);
    });

    it('TestCaseInsensitive', function() {
        let engine = new TemplateEngine().addFile(GetExampleFilePath('CaseInsensitive.lg'));
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow'
            },
            {
                time: '8 pm',
                date: 'tomorrow'
            }
        ];

        let evaled = engine.evaluateTemplate('ShowAlarms', { alarms: alarms });
        assert.strictEqual(evaled === 'You have two alarms', true, `Evaled is ${ evaled }`);

        let evaled1 = engine.evaluateTemplate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1 === 'Happy Saturday!', true, `Evaled is ${ evaled1 }`);
    });

    it('TestListWithOnlyOneElement', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('8.lg'));
        var evaled = engine.evaluateTemplate('ShowTasks', { recentTasks: ['Task1'] });
        assert.strictEqual(evaled === 'Your most recent task is Task1. You can let me know if you want to add or complete a task.', true, `Evaled is ${ evaled }`);
    });

    it('TestTemplateNameWithDotIn', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('TemplateNameWithDot.lg'));
        var evaled1 = engine.evaluateTemplate('Hello.World', '');
        assert.strictEqual(evaled1 === 'Hello World', true, `Evaled is ${ evaled1 }`);

        var evaled2 = engine.evaluateTemplate('Hello', '');
        assert.strictEqual(evaled2 === 'Hello World', true, `Evaled is ${ evaled2 }`);
    });

    it('TestBasicInlineTemplate', function() {
        var emptyEngine = new TemplateEngine();
        assert.strictEqual(emptyEngine.evaluate('Hi'), 'Hi', emptyEngine.evaluate('Hi'));
        assert.strictEqual(emptyEngine.evaluate('Hi', ''), 'Hi', emptyEngine.evaluate('Hi', ''));

        assert.strictEqual(emptyEngine.evaluate('Hi ${name}', { name: 'DL' }), 'Hi DL');

        assert.strictEqual(emptyEngine.evaluate('Hi ${name.FirstName}${name.LastName}', { name: { FirstName: 'D', LastName: 'L' } }), 'Hi DL');
        assert.strictEqual(emptyEngine.evaluate('Hi \n Hello', ''), 'Hi \n Hello');
        assert.strictEqual(emptyEngine.evaluate('Hi \r\n Hello', ''), 'Hi \r\n Hello');
        assert.strictEqual(emptyEngine.evaluate('Hi \r\n ${name}', { name: 'DL' }), 'Hi \r\n DL');
        assert.strictEqual(new TemplateEngine().evaluate('Hi', ''), 'Hi');
    });

    it('TestInlineTemplateWithTemplateFile', function() {
        var emptyEngine = new TemplateEngine().addFile(GetExampleFilePath('8.lg'));
        assert.strictEqual(emptyEngine.evaluate('Hi'), 'Hi', emptyEngine.evaluate('Hi'));
        assert.strictEqual(emptyEngine.evaluate('Hi', ''), 'Hi', emptyEngine.evaluate('Hi', ''));

        assert.strictEqual(emptyEngine.evaluate('Hi ${name}', { name: 'DL' }), 'Hi DL', emptyEngine.evaluate('Hi ${name}', { name: 'DL' }));

        assert.strictEqual(emptyEngine.evaluate('Hi ${name.FirstName}${name.LastName} ${RecentTasks()}', { name: { FirstName: 'D', LastName: 'L' } }), 'Hi DL You don\'t have any tasks.', emptyEngine.evaluate('Hi ${name.FirstName}${name.LastName} ${RecentTasks()}', { name: { FirstName: 'D', LastName: 'L' } }));

        assert.strictEqual(emptyEngine.evaluate('Hi ${name.FirstName}${name.LastName} ${RecentTasks()}', { name: { FirstName: 'D', LastName: 'L' }, recentTasks: ['task1'] }), 'Hi DL Your most recent task is task1. You can let me know if you want to add or complete a task.', emptyEngine.evaluate('Hi ${name.FirstName}${name.LastName} ${RecentTasks()}', { name: { FirstName: 'D', LastName: 'L' }, recentTasks: ['task1'] }));

    });

    it('TestMultiLine', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('MultilineTextForAdaptiveCard.lg'));
        var evaled1 = engine.evaluateTemplate('wPhrase', '');
        var options1 = ['\r\ncardContent\r\n', 'hello', '\ncardContent\n'];
        assert.strictEqual(options1.includes(evaled1), true, `1.Evaled is ${ evaled1 }`);

        var evaled2 = engine.evaluateTemplate('nameTemplate', { name: 'N' });
        var options2 = ['\r\nN\r\n', 'N', '\nN\n'];
        assert.strictEqual(options2.includes(evaled2), true, `2.Evaled is ${ evaled2 }`);

        var evaled3 = engine.evaluateTemplate('adaptivecardsTemplate', '');
        console.log(evaled3);

        var evaled4 = engine.evaluateTemplate('refTemplate', '');
        var options4 = ['\r\nhi\r\n', '\nhi\n'];
        assert.strictEqual(options4.includes(evaled4), true, `4.Evaled is ${ evaled4 }`);
    });

    it('TestTemplateRef', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('TemplateRef.lg'));
        var scope = { time: 'morning', name: 'Dong Lei' };
        var evaled1 = engine.evaluateTemplate('Hello', scope);
        assert.strictEqual(evaled1, 'Good morning Dong Lei', `Evaled is ${ evaled1 }`);
    });

    it('TestEscapeCharacter', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('EscapeCharacter.lg'));
        var evaled = engine.evaluateTemplate('wPhrase', undefined);
        assert.strictEqual(evaled, 'Hi \r\n\t[]{}\\', 'Happy path failed.');

        evaled = engine.evaluateTemplate('otherEscape', undefined);
        assert.strictEqual(evaled, 'Hi y ', 'Happy path failed.');

        evaled = engine.evaluateTemplate('escapeInExpression', undefined);
        assert.strictEqual(evaled, 'Hi hello\\\\');

        evaled = engine.evaluateTemplate('escapeInExpression2', undefined);
        assert.strictEqual(evaled, 'Hi hello\'');

        evaled = engine.evaluateTemplate('escapeInExpression3', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = engine.evaluateTemplate('escapeInExpression4', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = engine.evaluateTemplate('escapeInExpression5', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = engine.evaluateTemplate('escapeInExpression6', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = engine.evaluateTemplate('showTodo', { todos: ['A', 'B', 'C'] });
        assert.strictEqual(evaled.replace(/\r\n/g, '\n'), '\n    Your most recent 3 tasks are\n    * A\n* B\n* C\n    ');

        evaled = engine.evaluateTemplate('showTodo', undefined);
        assert.strictEqual(evaled.replace(/\r\n/g, '\n'), '\n    You don\'t have any "t\\\\odo\'".\n    ');
    });

    it('TestAnalyzer', function() {
        var testData = [
            {
                name: 'orderReadOut',
                variableOptions: ['orderType', 'userName', 'base', 'topping', 'bread', 'meat'],
                templateRefOptions: ['wPhrase', 'pizzaOrderConfirmation', 'sandwichOrderConfirmation']
            },
            {
                name: 'sandwichOrderConfirmation',
                variableOptions: ['bread', 'meat'],
                templateRefOptions: []
            },
            {
                name: 'template1',
                // TODO: input.property should really be: customer.property but analyzer needs to be 
                variableOptions: ['alarms', 'customer', 'tasks[0]', 'age', 'city'],
                templateRefOptions: ['template2', 'template3', 'template4', 'template5', 'template6']
            },
            {
                name: 'coffee-to-go-order',
                variableOptions: ['coffee', 'userName', 'size', 'price'],
                templateRefOptions: ['wPhrase', 'LatteOrderConfirmation', 'MochaOrderConfirmation', 'CuppuccinoOrderConfirmation']
            },
            {
                name: 'structureTemplate',
                variableOptions: [ 'text', 'newText' ],
                templateRefOptions: [ 'ST2' ]
            
            }
        ];
        for (const testItem of testData) {
            var engine = new TemplateEngine().addFile(GetExampleFilePath('Analyzer.lg'));
            var evaled1 = engine.analyzeTemplate(testItem.name);
            var variableEvaled = evaled1.Variables;
            var variableEvaledOptions = testItem.variableOptions;
            assert.strictEqual(variableEvaled.length, variableEvaledOptions.length);
            variableEvaledOptions.forEach(element => assert.strictEqual(variableEvaled.includes(element), true));
            var templateEvaled = evaled1.TemplateReferences;
            var templateEvaledOptions = testItem.templateRefOptions;
            assert.strictEqual(templateEvaled.length, templateEvaledOptions.length);
            templateEvaledOptions.forEach(element => assert.strictEqual(templateEvaled.includes(element), true));
        }
    });

    it('TestlgTemplateFunction', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('lgTemplate.lg'));
        var evaled = engine.evaluateTemplate('TemplateC', '');
        var options = ['Hi', 'Hello'];
        assert.strictEqual(options.includes(evaled), true);

        evaled = engine.evaluateTemplate('TemplateD', { b: 'morning' });
        options = ['Hi morning', 'Hello morning'];
        assert.strictEqual(options.includes(evaled), true);
    });

    it('TestTemplateAsFunction', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('TemplateAsFunction.lg'));

        var evaled = engine.evaluateTemplate('Test2');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('Test3');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('Test4');
        assert.strictEqual(evaled.trim(), 'hello world', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('dupNameWithTemplate');
        assert.strictEqual(evaled, 'calculate length of ms by user\'s template', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('dupNameWithBuiltinFunc');
        assert.strictEqual(evaled, 2, `Evaled is ${ evaled }`);
    });

    it('TestAnalyzelgTemplateFunction', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('lgTemplate.lg'));
        var evaled = engine.analyzeTemplate('TemplateD');
        var variableEvaled = evaled.Variables;
        var options = ['b'];
        assert.strictEqual(variableEvaled.length, options.length);
        options.forEach(e => assert.strictEqual(variableEvaled.includes(e), true));
    });

    it('TestExceptionCatch', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('ExceptionCatch.lg'));
        try {
            engine.evaluateTemplate('NoVariableMatch');
            assert.fail('Should throw exception.');
        } catch (e) {
            console.log(e.message);
        }
    });

    it('TestMultipleLgFiles', function() {
        var file123 = [
            GetExampleFilePath('MultiFile-Part1.lg'),
            GetExampleFilePath('MultiFile-Part2.lg'),
            GetExampleFilePath('MultiFile-Part3.lg'),
        ];

        var msg = 'hello from t1, ref template2: \'hello from t2, ref template3: hello from t3\' and ref template3: \'hello from t3\'';

        var engine = new TemplateEngine().addFiles([file123[0], file123[1], file123[2]]);
        assert.strictEqual(engine.evaluateTemplate('template1'), msg);

        engine = new TemplateEngine().addFiles([file123[1], file123[0], file123[2]]);
        assert.strictEqual(engine.evaluateTemplate('template1'), msg);

        engine = new TemplateEngine().addFiles([file123[2], file123[1], file123[0]]);
        assert.strictEqual(engine.evaluateTemplate('template1'), msg);
    });

    it('TestImportLgFiles', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('importExamples/import.lg'));

        // Assert 6.lg is imported only once when there are several relative paths which point to the same file.
        // Assert import cycle loop is handled well as expected when a file imports itself.
        assert.strictEqual(engine.templates.length, 14);

        const options1 = ['Hi', 'Hello', 'Hey'];
        var evaled = engine.evaluateTemplate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        evaled = engine.evaluateTemplate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        const options3 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = engine.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);

        const options4 = ['Hi 2', 'Hello 2'];
        evaled = engine.evaluateTemplate('basicTemplate2');
        assert.strictEqual(options4.includes(evaled), true, `Evaled is ${ evaled }`);

        const options5 = ['Hi 2', 'Hello 2'];
        evaled = engine.evaluateTemplate('template3');
        assert.strictEqual(options5.includes(evaled), true, `Evaled is ${ evaled }`);

        // Assert 6.lg of relative path is imported from text.
        engine = new TemplateEngine().addText(`# basicTemplate\r\n- Hi\r\n- Hello\r\n[import](./6.lg)`, GetExampleFilePath('xx.lg'));

        assert.strictEqual(engine.templates.length, 8);

        evaled = engine.evaluateTemplate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);
    });

    it('TestRegex', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('Regex.lg'));
        var evaled = engine.evaluateTemplate('wPhrase');
        assert.strictEqual(evaled, 'Hi');

        var evaled = engine.evaluateTemplate('wPhrase', {name: 'jack'});
        assert.strictEqual(evaled, 'Hi jack');

        var evaled = engine.evaluateTemplate('wPhrase', {name: 'morethanfive'});
        assert.strictEqual(evaled, 'Hi');
    });

    it('TestLgFileImportMultipleTimes', function() {
        let engine = new TemplateEngine().addFiles([GetExampleFilePath('importExamples/import.lg'), GetExampleFilePath('importExamples/import2.lg')]);

        // Assert 6.lg is imported only once and no exceptions are thrown when it is imported from multiple files.
        assert.strictEqual(engine.templates.length, 14);

        const options1 = ['Hi', 'Hello', 'Hey'];
        var evaled = engine.evaluateTemplate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        evaled = engine.evaluateTemplate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        const options3 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = engine.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);

        const options4 = ['Hi 2', 'Hello 2'];
        evaled = engine.evaluateTemplate('basicTemplate2');
        assert.strictEqual(options4.includes(evaled), true, `Evaled is ${ evaled }`);

        var evaled = engine.evaluateTemplate('basicTemplate3');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('basicTemplate4');
        assert.strictEqual(options4.includes(evaled), true, `Evaled is ${ evaled }`);

        engine = new TemplateEngine().addFile(GetExampleFilePath('importExamples/import.lg'));
        try {
            engine.addFile(GetExampleFilePath('importExamples/import2.lg'));
            assert.fail('Should throw error.');
        } catch (e) {
            console.log(e.message);
            assert.strictEqual(e.message.includes('Dup definitions found for template wPhrase'), true);
        }

        engine = new TemplateEngine().addFiles([GetExampleFilePath('importExamples/import.lg')]);
        try {
            engine.addFiles([GetExampleFilePath('importExamples/import2.lg')]);
            assert.fail('Should throw error.');
        } catch (e) {
            assert.strictEqual(e.message.includes('Dup definitions found for template wPhrase'), true);
        }
    });

    it('TestExpandTemplate', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('Expand.lg'));
        
        // without scope
        var evaled = engine.expandTemplate('FinalGreeting');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
        let expectedResults = ['Hi Morning', 'Hi Evening', 'Hello Morning', 'Hello Evening'];
        expectedResults.forEach(x => assert(evaled.includes(x)));

        // with scope
        evaled = engine.expandTemplate('TimeOfDayWithCondition', { time: 'evening'});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        expectedResults = ['Hi Evening', 'Hello Evening'];
        expectedResults.forEach(x => assert(evaled.includes(x)));

        // with scope
        evaled = engine.expandTemplate('greetInAWeek', {day:'Sunday'});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        expectedResults = ['Nice Sunday!', 'Happy Sunday!'];
        expectedResults.forEach(x => assert(evaled.includes(x)));
    });

    it('TestExpandTemplateWithRef', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('Expand.lg'));
        
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow'
            },
            {
                time: '8 pm',
                date: 'tomorrow'
            }
        ];
        
        var evaled = engine.expandTemplate('ShowAlarmsWithLgTemplate', {alarms});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        assert.strictEqual(evaled[0], 'You have 2 alarms, they are 8 pm at tomorrow', `Evaled is ${ evaled }`);
        assert.strictEqual(evaled[1], 'You have 2 alarms, they are 8 pm of tomorrow', `Evaled is ${ evaled }`);
    });

    it('TestExpandTemplateWithRefInMultiLine', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('Expand.lg'));
        
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow'
            },
            {
                time: '8 pm',
                date: 'tomorrow'
            }
        ];
        
        var evaled = engine.expandTemplate('ShowAlarmsWithMultiLine', {alarms});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        const eval1Options = ['\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n', '\nYou have 2 alarms.\nThey are 8 pm at tomorrow\n'];
        const eval2Options = ['\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n', '\nYou have 2 alarms.\nThey are 8 pm of tomorrow\n'];
        assert(eval1Options.includes(evaled[0]));
        assert(eval2Options.includes(evaled[1]));
    });

    it('TestExpandTemplateWithFunction', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('Expand.lg'));
        
        const alarms = [
            {
                time: '7 am',
                date: 'tomorrow'
            },
            {
                time: '8 pm',
                date: 'tomorrow'
            }
        ];
        
        var evaled = engine.expandTemplate('ShowAlarmsWithForeach', {alarms});
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        const evalOptions = [
            'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am at tomorrow and 8 pm of tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm of tomorrow'
        ];

        assert(evalOptions.includes(evaled[0]));

        evaled = engine.expandTemplate('T2');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = engine.expandTemplate('T3');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = engine.expandTemplate('T4');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === 'ey' || evaled[0] === 'el');
    });

    it('TestEvalExpression', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('EvalExpression.lg'));
        const userName = 'MS';
        var evaled = engine.evaluateTemplate('template1', {userName});
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('template2', {userName});
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('template3', {userName});
        assert.strictEqual(evaled, 'HiMS', `Evaled is ${ evaled }`);

        const options1 = ['\r\nHi MS\r\n', '\nHi MS\n'];
        evaled = engine.evaluateTemplate('template4', { userName});
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['\r\nHiMS\r\n', '\nHiMS\n'];
        evaled = engine.evaluateTemplate('template5', { userName});
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = engine.evaluateTemplate('template6', {userName});
        assert.strictEqual(evaled, 'goodmorning', `Evaled is ${ evaled }`);
    });


    it('TestLGResource', function() {
        var lgResource = LGParser.parse(fs.readFileSync(GetExampleFilePath('2.lg'), 'utf-8'));

        assert.strictEqual(lgResource.templates.length, 1);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.templates[0].name, 'wPhrase');
        assert.strictEqual(lgResource.templates[0].body.replace(/\r\n/g, '\n'), '- Hi\n- Hello\n- Hiya\n- Hi');

        lgResource = lgResource.addTemplate('newtemplate', ['age', 'name'], '- hi ');
        assert.strictEqual(lgResource.templates.length, 2);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.templates[1].name, 'newtemplate');
        assert.strictEqual(lgResource.templates[1].parameters.length, 2);
        assert.strictEqual(lgResource.templates[1].parameters[0], 'age');
        assert.strictEqual(lgResource.templates[1].parameters[1], 'name');
        assert.strictEqual(lgResource.templates[1].body, '- hi ');

        lgResource = lgResource.addTemplate('newtemplate2', undefined, '- hi2 ');
        assert.strictEqual(lgResource.templates.length, 3);
        assert.strictEqual(lgResource.templates[2].name, 'newtemplate2');
        assert.strictEqual(lgResource.templates[2].body, '- hi2 ');

        lgResource = lgResource.updateTemplate('newtemplate', 'newtemplateName', ['newage', 'newname'], '- new hi\r\n#hi');
        assert.strictEqual(lgResource.templates.length, 3);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.templates[1].name, 'newtemplateName');
        assert.strictEqual(lgResource.templates[1].parameters.length, 2);
        assert.strictEqual(lgResource.templates[1].parameters[0], 'newage');
        assert.strictEqual(lgResource.templates[1].parameters[1], 'newname');
        assert.strictEqual(lgResource.templates[1].body, '- new hi\r\n- #hi');

        lgResource = lgResource.updateTemplate('newtemplate2', 'newtemplateName2', ['newage2', 'newname2'], '- new hi\r\n#hi2');
        assert.strictEqual(lgResource.templates.length, 3);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.templates[2].name, 'newtemplateName2');
        assert.strictEqual(lgResource.templates[2].body, '- new hi\r\n- #hi2');

        lgResource = lgResource.deleteTemplate('newtemplateName');
        assert.strictEqual(lgResource.templates.length, 2);

        lgResource = lgResource.deleteTemplate('newtemplateName2');
        assert.strictEqual(lgResource.templates.length, 1);
    });

    it('TestMemoryScope', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('MemoryScope.lg'));
        var evaled = engine.evaluateTemplate('T1', { turn: { name: 'Dong', count: 3 } });
        assert.strictEqual(evaled, 'Hi Dong, welcome to Seattle, Seattle is a beautiful place, how many burgers do you want, 3?');

        const objscope = {
            schema: {
                Bread: {
                    enum: ['A', 'B']
                }
            }
        };
        var scope = new SimpleObjectMemory(objscope);
         
        evaled = engine.evaluateTemplate('AskBread', scope);
        assert.strictEqual(evaled, 'Which Bread, A or B do you want?');
    });

    it('TestStructuredTemplate', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('StructuredTemplate.lg'));

        var evaled = engine.evaluateTemplate('AskForAge.prompt');
        assert.equal(evaled.text, evaled.speak);

        evaled = engine.evaluateTemplate('AskForAge.prompt2');
        if (evaled.text.includes('how old')){
            assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"how old are you?","suggestedactions":["10","20","30"]}'));
        } else {
            assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"what\'s your age?","suggestedactions":["10","20","30"]}'));
        }

        evaled = engine.evaluateTemplate('AskForAge.prompt3');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"${GetAge()}","suggestions":["10 | cards","20 | cards"]}'));

        evaled = engine.evaluateTemplate('T1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"This is awesome","speak":"foo bar I can also speak!"}'));

        evaled = engine.evaluateTemplate('ST1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"foo","speak":"bar"}'));

        evaled = engine.evaluateTemplate('AskForColor');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","suggestedactions":[{"lgType":"MyStruct","speak":"bar","text":"zoo"},{"lgType":"Activity","speak":"I can also speak!"}]}'));

        evaled = engine.evaluateTemplate('MultiExpression');
        assert.equal(evaled, '{"lgType":"Activity","speak":"I can also speak!"} {"lgType":"MyStruct","text":"hi"}');

        evaled = engine.evaluateTemplate('StructuredTemplateRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"hi"}'));

        evaled = engine.evaluateTemplate('MultiStructuredRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","list":[{"lgType":"SubStruct","text":"hello"},{"lgType":"SubStruct","text":"world"}]}'));

        evaled = engine.evaluateTemplate('templateWithSquareBrackets', {manufacturer: {Name : 'Acme Co'}});
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Struct","text":"Acme Co"}'));

        evaled = engine.evaluateTemplate('ValueWithEqualsMark', {name : 'Jack'});
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"Hello! welcome back. I have your name = Jack"}'));
    });

    it('TestEvaluateOnce', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('EvaluateOnce.lg'));

        var evaled = engine.evaluateTemplate('templateWithSameParams', { param: 'ms' });
        assert.notEqual(evaled, undefined);
        
        const resultList = evaled.split(' ');
        assert.equal(resultList.length, 2);

        assert.equal(resultList[0], resultList[1]);

        // maybe has different values
        evaled = engine.evaluateTemplate('templateWithDifferentParams', { param1: 'ms', param2: 'newms' });
    });

    it('TestConditionExpression', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('ConditionExpression.lg'));

        var evaled = engine.evaluateTemplate('conditionTemplate', { num: 1 });
        assert.equal(evaled, 'Your input is one');
        
        evaled = engine.evaluateTemplate('conditionTemplate', { num: 2 });
        assert.equal(evaled, 'Your input is two');

        evaled = engine.evaluateTemplate('conditionTemplate', { num: 3 });
        assert.equal(evaled, 'Your input is three');

        evaled = engine.evaluateTemplate('conditionTemplate', { num: 4 });
        assert.equal(evaled, 'Your input is not one, two or three');
    });

    it('TestExpandTemplateWithStructuredLG', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('StructuredTemplate.lg'));

        var evaled = engine.expandTemplate('AskForAge.prompt');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
    
        let expectedResults = [
            '{"lgType":"Activity","text":"how old are you?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"how old are you?","speak":"what\'s your age?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"what\'s your age?"}'
        ];
        expectedResults.forEach( u => assert(evaled.includes(u)));

        evaled = engine.expandTemplate('ExpanderT1');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
    
        expectedResults = [
            '{"lgType":"MyStruct","text":"Hi","speak":"how old are you?"}',
            '{"lgType":"MyStruct","text":"Hi","speak":"what\'s your age?"}',
            '{"lgType":"MyStruct","text":"Hello","speak":"how old are you?"}',
            '{"lgType":"MyStruct","text":"Hello","speak":"what\'s your age?"}'
        ];
        expectedResults.forEach( u => assert(evaled.includes(u)));
    });

    it('TestExpressionextract', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('ExpressionExtract.lg'));

        var evaled1 = engine.evaluateTemplate('templateWithBrackets');
        var evaled2 = engine.evaluateTemplate('templateWithBrackets2');
        var evaled3 = engine.evaluateTemplate('templateWithBrackets3').toString().trim();
        let espectedResult = 'don\'t mix {} and \'{}\'';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = engine.evaluateTemplate('templateWithQuotationMarks');
        evaled2 = engine.evaluateTemplate('templateWithQuotationMarks2');
        evaled3 = engine.evaluateTemplate('templateWithQuotationMarks3').toString().trim();
        espectedResult = 'don\'t mix {"} and ""\'"';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
        
        evaled1 = engine.evaluateTemplate('templateWithUnpairedBrackets1');
        evaled2 = engine.evaluateTemplate('templateWithUnpairedBrackets12');
        evaled3 = engine.evaluateTemplate('templateWithUnpairedBrackets13').toString().trim();
        espectedResult = '{prefix 5 sufix';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = engine.evaluateTemplate('templateWithUnpairedBrackets2');
        evaled2 = engine.evaluateTemplate('templateWithUnpairedBrackets22');
        evaled3 = engine.evaluateTemplate('templateWithUnpairedBrackets23').toString().trim();
        espectedResult = 'prefix 5 sufix}';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
    });

    it('TestEmptyArratAndObject', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('EmptyArrayAndObject.lg'));

        var evaled = engine.evaluateTemplate('template', {list:[], obj: {}});
        assert.strictEqual(evaled, 'list and obj are both empty');

        var evaled = engine.evaluateTemplate('template', {list:[], obj:new Map()});
        assert.strictEqual(evaled, 'list and obj are both empty');

        var evaled = engine.evaluateTemplate('template', {list:['hi'], obj: {}});
        assert.strictEqual(evaled, 'obj is empty');

        var evaled = engine.evaluateTemplate('template', {list:[], obj: {a: 'a'}});
        assert.strictEqual(evaled, 'list is empty');

        const map = new Map();
        map.set('a', 'a');
        var evaled = engine.evaluateTemplate('template', {list:[], obj: map});
        assert.strictEqual(evaled, 'list is empty');

        var evaled = engine.evaluateTemplate('template', {list:[{}], obj : {a : 'a'}});
        assert.strictEqual(evaled, 'list and obj are both not empty.');        
    });

    it('TestIsTemplateFunction', function() {
        var engine = new TemplateEngine().addFile(GetExampleFilePath('IsTemplate.lg'));

        var evaled = engine.evaluateTemplate('template2', {templateName:'template1'});
        assert.strictEqual(evaled, 'template template1 exists');

        var evaled = engine.evaluateTemplate('template2', {templateName:'wPhrase'});
        assert.strictEqual(evaled, 'template wPhrase exists');

        var evaled = engine.evaluateTemplate('template2', {templateName:'xxx'});
        assert.strictEqual(evaled, 'template xxx does not exist'); 
    });
});
