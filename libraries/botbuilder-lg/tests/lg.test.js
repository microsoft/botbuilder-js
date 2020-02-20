const { LGParser } = require('../');
const { SimpleObjectMemory } = require('adaptive-expressions');
const assert = require('assert');
const fs = require('fs');

function GetExampleFilePath(fileName) {
    return `${ __dirname }/testData/examples/` + fileName;
}


describe('LG', function() {
    it('TestBasic', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('2.lg'));
        let evaled = LGFile.evaluateTemplate('wPhrase');
        const options = ['Hi', 'Hello', 'Hiya'];
        assert.strictEqual(options.includes(evaled), true, `The result ${ evaled } is not in those options [${ options.join(',') }]`);
    });

    it('TestBasicTemplateReference', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('3.lg'));
        let evaled = LGFile.evaluateTemplate('welcome-user', undefined);
        const options = ['Hi', 'Hello', 'Hiya', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert.strictEqual(options.includes(evaled), true, `The result ${ evaled } is not in those options [${ options.join(',') }]`);
    });

    it('TestBasicTemplateRefAndEntityRef', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('4.lg'));
        let userName = 'DL';
        let evaled = LGFile.evaluateTemplate('welcome-user', { userName: userName });
        const options = ['Hi', 'Hello', 'Hiya ', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert.strictEqual(evaled.includes(userName), true, `The result ${ evaled } does not contiain ${ userName }`);
    });

    it('TestBaicConditionalTemplate', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('5.lg'));

        let evaled = LGFile.evaluateTemplate('time-of-day-readout', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('time-of-day-readout', { timeOfDay: 'evening' });
        assert.strictEqual(evaled === 'Good evening' || evaled === 'Evening! ', true, `Evaled is ${ evaled }`);
    });

    it('TestBasicConditionalTemplateWithoutDefault', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('5.lg'));

        let evaled = LGFile.evaluateTemplate('time-of-day-readout-without-default', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('time-of-day-readout-without-default2', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('time-of-day-readout-without-default2', { timeOfDay: 'evening' });
        assert.strictEqual(evaled, undefined, `Evaled is ${ evaled } which should be undefined.`);
    });

    it('TestBasicTemplateRefWithParameters', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('6.lg'));

        let evaled = LGFile.evaluateTemplate('welcome', undefined);
        const options1 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = LGFile.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);
    });

    it('TestBasicSwitchCaseTemplate', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('switchcase.lg'));
        let evaled1 = LGFile.evaluateTemplate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1 === 'Happy Saturday!', true, `Evaled is ${ evaled1 }`);

        let evaled3 = LGFile.evaluateTemplate('greetInAWeek', { day: 'Monday' });
        assert.strictEqual(evaled3 === 'Work Hard!', true, `Evaled is ${ evaled3 }`);
    });

    it('TestBasicListSupport', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('BasicList.lg'));

        let evaled = LGFile.evaluateTemplate('BasicJoin', { items: ['1'] });
        assert.strictEqual(evaled, '1', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('BasicJoin', { items: ['1', '2'] });
        assert.strictEqual(evaled, '1, 2', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('BasicJoin', { items: ['1', '2', '3'] });
        assert.strictEqual(evaled, '1, 2 and 3', `Evaled is ${ evaled }`);
    });

    it('TestBasicExtendedFunctions', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('6.lg'));
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

        let evaled = LGFile.evaluateTemplate('ShowAlarmsWithForeach', { alarms: alarms });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('ShowAlarmsWithLgTemplate', { alarms: alarms });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('ShowAlarmsWithDynamicLgTemplate', { alarms: alarms, templateName: 'ShowAlarm' });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);
    });

    it('TestCaseInsensitive', function() {
        let LGFile = LGParser.parseFile(GetExampleFilePath('CaseInsensitive.lg'));
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

        let evaled = LGFile.evaluateTemplate('ShowAlarms', { alarms: alarms });
        assert.strictEqual(evaled === 'You have two alarms', true, `Evaled is ${ evaled }`);

        let evaled1 = LGFile.evaluateTemplate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1 === 'Happy Saturday!', true, `Evaled is ${ evaled1 }`);
    });

    it('TestListWithOnlyOneElement', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('8.lg'));
        var evaled = LGFile.evaluateTemplate('ShowTasks', { recentTasks: ['Task1'] });
        assert.strictEqual(evaled === 'Your most recent task is Task1. You can let me know if you want to add or complete a task.', true, `Evaled is ${ evaled }`);
    });

    it('TestTemplateNameWithDotIn', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('TemplateNameWithDot.lg'));
        var evaled1 = LGFile.evaluateTemplate('Hello.World', '');
        assert.strictEqual(evaled1 === 'Hello World', true, `Evaled is ${ evaled1 }`);

        var evaled2 = LGFile.evaluateTemplate('Hello', '');
        assert.strictEqual(evaled2 === 'Hello World', true, `Evaled is ${ evaled2 }`);
    });

    it('TestMultiLine', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('MultilineTextForAdaptiveCard.lg'));
        var evaled1 = LGFile.evaluateTemplate('wPhrase', '');
        var options1 = ['\r\ncardContent\r\n', 'hello', '\ncardContent\n'];
        assert.strictEqual(options1.includes(evaled1), true, `1.Evaled is ${ evaled1 }`);

        var evaled2 = LGFile.evaluateTemplate('nameTemplate', { name: 'N' });
        var options2 = ['\r\nN\r\n', 'N', '\nN\n'];
        assert.strictEqual(options2.includes(evaled2), true, `2.Evaled is ${ evaled2 }`);

        var evaled3 = LGFile.evaluateTemplate('adaptivecardsTemplate', '');
        console.log(evaled3);

        var evaled4 = LGFile.evaluateTemplate('refTemplate', '');
        var options4 = ['\r\nhi\r\n', '\nhi\n'];
        assert.strictEqual(options4.includes(evaled4), true, `4.Evaled is ${ evaled4 }`);
    });

    it('TestTemplateRef', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('TemplateRef.lg'));
        var scope = { time: 'morning', name: 'Dong Lei' };
        var evaled1 = LGFile.evaluateTemplate('Hello', scope);
        assert.strictEqual(evaled1, 'Good morning Dong Lei', `Evaled is ${ evaled1 }`);
    });

    it('TestEscapeCharacter', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('EscapeCharacter.lg'));
        var evaled = LGFile.evaluateTemplate('wPhrase', undefined);
        assert.strictEqual(evaled, 'Hi \r\n\t[]{}\\', 'Happy path failed.');

        evaled = LGFile.evaluateTemplate('otherEscape', undefined);
        assert.strictEqual(evaled, 'Hi y ', 'Happy path failed.');

        evaled = LGFile.evaluateTemplate('escapeInExpression', undefined);
        assert.strictEqual(evaled, 'Hi hello\\\\');

        evaled = LGFile.evaluateTemplate('escapeInExpression2', undefined);
        assert.strictEqual(evaled, 'Hi hello\'');

        evaled = LGFile.evaluateTemplate('escapeInExpression3', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = LGFile.evaluateTemplate('escapeInExpression4', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = LGFile.evaluateTemplate('escapeInExpression5', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = LGFile.evaluateTemplate('escapeInExpression6', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = LGFile.evaluateTemplate('showTodo', { todos: ['A', 'B', 'C'] });
        assert.strictEqual(evaled.replace(/\r\n/g, '\n'), '\n    Your most recent 3 tasks are\n    * A\n* B\n* C\n    ');

        evaled = LGFile.evaluateTemplate('showTodo', undefined);
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
            var LGFile = LGParser.parseFile(GetExampleFilePath('Analyzer.lg'));
            var evaled1 = LGFile.analyzeTemplate(testItem.name);
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
        var LGFile = LGParser.parseFile(GetExampleFilePath('lgTemplate.lg'));
        var evaled = LGFile.evaluateTemplate('TemplateC', '');
        var options = ['Hi', 'Hello'];
        assert.strictEqual(options.includes(evaled), true);

        evaled = LGFile.evaluateTemplate('TemplateD', { b: 'morning' });
        options = ['Hi morning', 'Hello morning'];
        assert.strictEqual(options.includes(evaled), true);
    });

    it('TestTemplateAsFunction', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('TemplateAsFunction.lg'));

        var evaled = LGFile.evaluateTemplate('Test2');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('Test3');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('Test4');
        assert.strictEqual(evaled.trim(), 'hello world', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('dupNameWithTemplate');
        assert.strictEqual(evaled, 'calculate length of ms by user\'s template', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('dupNameWithBuiltinFunc');
        assert.strictEqual(evaled, 2, `Evaled is ${ evaled }`);
    });

    it('TestAnalyzelgTemplateFunction', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('lgTemplate.lg'));
        var evaled = LGFile.analyzeTemplate('TemplateD');
        var variableEvaled = evaled.Variables;
        var options = ['b'];
        assert.strictEqual(variableEvaled.length, options.length);
        options.forEach(e => assert.strictEqual(variableEvaled.includes(e), true));
    });

    it('TestImportLgFiles', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('importExamples/import.lg'));

        // Assert 6.lg is imported only once when there are several relative paths which point to the same file.
        // Assert import cycle loop is handled well as expected when a file imports itself.
        assert.strictEqual(LGFile.allTemplates.length, 14);

        const options1 = ['Hi', 'Hello', 'Hey'];
        var evaled = LGFile.evaluateTemplate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        evaled = LGFile.evaluateTemplate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        const options3 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = LGFile.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);

        const options4 = ['Hi 2', 'Hello 2'];
        evaled = LGFile.evaluateTemplate('basicTemplate2');
        assert.strictEqual(options4.includes(evaled), true, `Evaled is ${ evaled }`);

        const options5 = ['Hi 2', 'Hello 2'];
        evaled = LGFile.evaluateTemplate('template3');
        assert.strictEqual(options5.includes(evaled), true, `Evaled is ${ evaled }`);

        // Assert 6.lg of relative path is imported from text.
        LGFile = LGParser.parseText(`# basicTemplate\r\n- Hi\r\n- Hello\r\n[import](./6.lg)`, GetExampleFilePath('xx.lg'));

        assert.strictEqual(LGFile.allTemplates.length, 8);

        evaled = LGFile.evaluateTemplate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);
    });

    it('TestRegex', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('Regex.lg'));
        var evaled = LGFile.evaluateTemplate('wPhrase');
        assert.strictEqual(evaled, 'Hi');

        var evaled = LGFile.evaluateTemplate('wPhrase', {name: 'jack'});
        assert.strictEqual(evaled, 'Hi jack');

        var evaled = LGFile.evaluateTemplate('wPhrase', {name: 'morethanfive'});
        assert.strictEqual(evaled, 'Hi');
    });

    it('TestExpandTemplate', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('Expand.lg'));
        
        // without scope
        var evaled = LGFile.expandTemplate('FinalGreeting');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
        let expectedResults = ['Hi Morning', 'Hi Evening', 'Hello Morning', 'Hello Evening'];
        expectedResults.forEach(x => assert(evaled.includes(x)));

        // with scope
        evaled = LGFile.expandTemplate('TimeOfDayWithCondition', { time: 'evening'});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        expectedResults = ['Hi Evening', 'Hello Evening'];
        expectedResults.forEach(x => assert(evaled.includes(x)));

        // with scope
        evaled = LGFile.expandTemplate('greetInAWeek', {day:'Sunday'});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        expectedResults = ['Nice Sunday!', 'Happy Sunday!'];
        expectedResults.forEach(x => assert(evaled.includes(x)));
    });

    it('TestExpandTemplateWithRef', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('Expand.lg'));
        
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
        
        var evaled = LGFile.expandTemplate('ShowAlarmsWithLgTemplate', {alarms});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        assert.strictEqual(evaled[0], 'You have 2 alarms, they are 8 pm at tomorrow', `Evaled is ${ evaled }`);
        assert.strictEqual(evaled[1], 'You have 2 alarms, they are 8 pm of tomorrow', `Evaled is ${ evaled }`);
    });

    it('TestExpandTemplateWithRefInMultiLine', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('Expand.lg'));
        
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
        
        var evaled = LGFile.expandTemplate('ShowAlarmsWithMultiLine', {alarms});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        const eval1Options = ['\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n', '\nYou have 2 alarms.\nThey are 8 pm at tomorrow\n'];
        const eval2Options = ['\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n', '\nYou have 2 alarms.\nThey are 8 pm of tomorrow\n'];
        assert(eval1Options.includes(evaled[0]));
        assert(eval2Options.includes(evaled[1]));
    });

    it('TestExpandTemplateWithFunction', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('Expand.lg'));
        
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
        
        var evaled = LGFile.expandTemplate('ShowAlarmsWithForeach', {alarms});
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        const evalOptions = [
            'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am at tomorrow and 8 pm of tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm of tomorrow'
        ];

        assert(evalOptions.includes(evaled[0]));

        evaled = LGFile.expandTemplate('T2');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = LGFile.expandTemplate('T3');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = LGFile.expandTemplate('T4');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === 'ey' || evaled[0] === 'el');
    });

    it('TestEvalExpression', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('EvalExpression.lg'));
        const userName = 'MS';
        var evaled = LGFile.evaluateTemplate('template1', {userName});
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('template2', {userName});
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('template3', {userName});
        assert.strictEqual(evaled, 'HiMS', `Evaled is ${ evaled }`);

        const options1 = ['\r\nHi MS\r\n', '\nHi MS\n'];
        evaled = LGFile.evaluateTemplate('template4', { userName});
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['\r\nHiMS\r\n', '\nHiMS\n'];
        evaled = LGFile.evaluateTemplate('template5', { userName});
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = LGFile.evaluateTemplate('template6', {userName});
        assert.strictEqual(evaled, 'goodmorning', `Evaled is ${ evaled }`);
    });


    it('TestLGResource', function() {
        var lgResource = LGParser.parseText(fs.readFileSync(GetExampleFilePath('2.lg'), 'utf-8'));

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
        var LGFile = LGParser.parseFile(GetExampleFilePath('MemoryScope.lg'));
        var evaled = LGFile.evaluateTemplate('T1', { turn: { name: 'Dong', count: 3 } });
        assert.strictEqual(evaled, 'Hi Dong, welcome to Seattle, Seattle is a beautiful place, how many burgers do you want, 3?');

        const objscope = {
            schema: {
                Bread: {
                    enum: ['A', 'B']
                }
            }
        };
        var scope = new SimpleObjectMemory(objscope);
         
        evaled = LGFile.evaluateTemplate('AskBread', scope);
        assert.strictEqual(evaled, 'Which Bread, A or B do you want?');
    });

    it('TestStructuredTemplate', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('StructuredTemplate.lg'));

        var evaled = LGFile.evaluateTemplate('AskForAge.prompt');
        assert.equal(evaled.text, evaled.speak);

        evaled = LGFile.evaluateTemplate('AskForAge.prompt2');
        if (evaled.text.includes('how old')){
            assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"how old are you?","suggestedactions":["10","20","30"]}'));
        } else {
            assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"what\'s your age?","suggestedactions":["10","20","30"]}'));
        }

        evaled = LGFile.evaluateTemplate('AskForAge.prompt3');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"${GetAge()}","suggestions":["10 | cards","20 | cards"]}'));

        evaled = LGFile.evaluateTemplate('T1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"This is awesome","speak":"foo bar I can also speak!"}'));

        evaled = LGFile.evaluateTemplate('ST1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"foo","speak":"bar"}'));

        evaled = LGFile.evaluateTemplate('AskForColor');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","suggestedactions":[{"lgType":"MyStruct","speak":"bar","text":"zoo"},{"lgType":"Activity","speak":"I can also speak!"}]}'));

        evaled = LGFile.evaluateTemplate('MultiExpression');
        assert.equal(evaled, '{"lgType":"Activity","speak":"I can also speak!"} {"lgType":"MyStruct","text":"hi"}');

        evaled = LGFile.evaluateTemplate('StructuredTemplateRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"hi"}'));

        evaled = LGFile.evaluateTemplate('MultiStructuredRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","list":[{"lgType":"SubStruct","text":"hello"},{"lgType":"SubStruct","text":"world"}]}'));

        evaled = LGFile.evaluateTemplate('templateWithSquareBrackets', {manufacturer: {Name : 'Acme Co'}});
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Struct","text":"Acme Co"}'));

        evaled = LGFile.evaluateTemplate('ValueWithEqualsMark', {name : 'Jack'});
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"Hello! welcome back. I have your name = Jack"}'));
    });

    it('TestEvaluateOnce', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('EvaluateOnce.lg'));

        var evaled = LGFile.evaluateTemplate('templateWithSameParams', { param: 'ms' });
        assert.notEqual(evaled, undefined);
        
        const resultList = evaled.split(' ');
        assert.equal(resultList.length, 2);

        assert.equal(resultList[0], resultList[1]);

        // maybe has different values
        evaled = LGFile.evaluateTemplate('templateWithDifferentParams', { param1: 'ms', param2: 'newms' });
    });

    it('TestConditionExpression', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('ConditionExpression.lg'));

        var evaled = LGFile.evaluateTemplate('conditionTemplate', { num: 1 });
        assert.equal(evaled, 'Your input is one');
        
        evaled = LGFile.evaluateTemplate('conditionTemplate', { num: 2 });
        assert.equal(evaled, 'Your input is two');

        evaled = LGFile.evaluateTemplate('conditionTemplate', { num: 3 });
        assert.equal(evaled, 'Your input is three');

        evaled = LGFile.evaluateTemplate('conditionTemplate', { num: 4 });
        assert.equal(evaled, 'Your input is not one, two or three');
    });

    it('TestExpandTemplateWithStructuredLG', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('StructuredTemplate.lg'));

        var evaled = LGFile.expandTemplate('AskForAge.prompt');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
    
        let expectedResults = [
            '{"lgType":"Activity","text":"how old are you?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"how old are you?","speak":"what\'s your age?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"what\'s your age?"}'
        ];
        expectedResults.forEach( u => assert(evaled.includes(u)));

        evaled = LGFile.expandTemplate('ExpanderT1');
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
        var LGFile = LGParser.parseFile(GetExampleFilePath('ExpressionExtract.lg'));

        var evaled1 = LGFile.evaluateTemplate('templateWithBrackets');
        var evaled2 = LGFile.evaluateTemplate('templateWithBrackets2');
        var evaled3 = LGFile.evaluateTemplate('templateWithBrackets3').toString().trim();
        let espectedResult = 'don\'t mix {} and \'{}\'';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = LGFile.evaluateTemplate('templateWithQuotationMarks');
        evaled2 = LGFile.evaluateTemplate('templateWithQuotationMarks2');
        evaled3 = LGFile.evaluateTemplate('templateWithQuotationMarks3').toString().trim();
        espectedResult = 'don\'t mix {"} and ""\'"';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
        
        evaled1 = LGFile.evaluateTemplate('templateWithUnpairedBrackets1');
        evaled2 = LGFile.evaluateTemplate('templateWithUnpairedBrackets12');
        evaled3 = LGFile.evaluateTemplate('templateWithUnpairedBrackets13').toString().trim();
        espectedResult = '{prefix 5 sufix';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = LGFile.evaluateTemplate('templateWithUnpairedBrackets2');
        evaled2 = LGFile.evaluateTemplate('templateWithUnpairedBrackets22');
        evaled3 = LGFile.evaluateTemplate('templateWithUnpairedBrackets23').toString().trim();
        espectedResult = 'prefix 5 sufix}';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
    });

    it('TestEmptyArratAndObject', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('EmptyArrayAndObject.lg'));

        var evaled = LGFile.evaluateTemplate('template', {list:[], obj: {}});
        assert.strictEqual(evaled, 'list and obj are both empty');

        var evaled = LGFile.evaluateTemplate('template', {list:[], obj:new Map()});
        assert.strictEqual(evaled, 'list and obj are both empty');

        var evaled = LGFile.evaluateTemplate('template', {list:['hi'], obj: {}});
        assert.strictEqual(evaled, 'obj is empty');

        var evaled = LGFile.evaluateTemplate('template', {list:[], obj: {a: 'a'}});
        assert.strictEqual(evaled, 'list is empty');

        const map = new Map();
        map.set('a', 'a');
        var evaled = LGFile.evaluateTemplate('template', {list:[], obj: map});
        assert.strictEqual(evaled, 'list is empty');

        var evaled = LGFile.evaluateTemplate('template', {list:[{}], obj : {a : 'a'}});
        assert.strictEqual(evaled, 'list and obj are both not empty.');        
    });

    it('TestIsTemplateFunction', function() {
        var LGFile = LGParser.parseFile(GetExampleFilePath('IsTemplate.lg'));

        var evaled = LGFile.evaluateTemplate('template2', {templateName:'template1'});
        assert.strictEqual(evaled, 'template template1 exists');

        var evaled = LGFile.evaluateTemplate('template2', {templateName:'wPhrase'});
        assert.strictEqual(evaled, 'template wPhrase exists');

        var evaled = LGFile.evaluateTemplate('template2', {templateName:'xxx'});
        assert.strictEqual(evaled, 'template xxx does not exist'); 
    });
});
