const { Templates } = require('../');
const { SimpleObjectMemory, ExpressionParser, ExpressionFunctions, Expression } = require('adaptive-expressions');
const assert = require('assert');
const fs = require('fs');

function GetExampleFilePath(fileName) {
    return `${ __dirname }/testData/examples/` + fileName;
}


describe('LG', function() {
    it('TestBasic', function() {
        let templates = Templates.parseFile(GetExampleFilePath('2.lg'));
        let evaled = templates.evaluate('wPhrase');
        const options = ['Hi', 'Hello', 'Hiya'];
        assert.strictEqual(options.includes(evaled), true, `The result ${ evaled } is not in those options [${ options.join(',') }]`);
    });

    it('TestBasicTemplateReference', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('3.lg'));
        console.log(lgFile.items[0].body);
        console.log(lgFile.items[1].body);
        let evaled = lgFile.evaluate('welcome-user', undefined);
        const options = ['Hi', 'Hello', 'Hiya', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert.strictEqual(options.includes(evaled), true, `The result ${ evaled } is not in those options [${ options.join(',') }]`);
    });

    it('TestBasicTemplateRefAndEntityRef', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('4.lg'));
        let userName = 'DL';
        let evaled = lgFile.evaluate('welcome-user', { userName: userName });
        const options = ['Hi', 'Hello', 'Hiya ', 'Hi :)', 'Hello :)', 'Hiya :)'];
        assert.strictEqual(evaled.includes(userName), true, `The result ${ evaled } does not contiain ${ userName }`);
    });

    it('TestBasicConditionalTemplate', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('5.lg'));

        let evaled = lgFile.evaluate('time-of-day-readout', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('time-of-day-readout', { timeOfDay: 'evening' });
        assert.strictEqual(evaled === 'Good evening' || evaled === 'Evening! ', true, `Evaled is ${ evaled }`);
    });

    it('TestBasicConditionalTemplateWithoutDefault', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('5.lg'));

        let evaled = lgFile.evaluate('time-of-day-readout-without-default', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('time-of-day-readout-without-default2', { timeOfDay: 'morning' });
        assert.strictEqual(evaled === 'Good morning' || evaled === 'Morning! ', true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('time-of-day-readout-without-default2', { timeOfDay: 'evening' });
        assert.strictEqual(evaled, undefined, `Evaled is ${ evaled } which should be undefined.`);
    });

    it('TestBasicTemplateRefWithParameters', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('6.lg'));

        let evaled = lgFile.evaluate('welcome', undefined);
        const options1 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = lgFile.evaluate('welcome', { userName: 'DL' });
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);
    });

    it('TestBasicSwitchCaseTemplate', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('switchcase.lg'));
        let evaled1 = lgFile.evaluate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1 === 'Happy Saturday!', true, `Evaled is ${ evaled1 }`);

        let evaled3 = lgFile.evaluate('greetInAWeek', { day: 'Monday' });
        assert.strictEqual(evaled3 === 'Work Hard!', true, `Evaled is ${ evaled3 }`);
    });

    it('TestBasicListSupport', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('BasicList.lg'));

        let evaled = lgFile.evaluate('BasicJoin', { items: ['1'] });
        assert.strictEqual(evaled, '1', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('BasicJoin', { items: ['1', '2'] });
        assert.strictEqual(evaled, '1, 2', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('BasicJoin', { items: ['1', '2', '3'] });
        assert.strictEqual(evaled, '1, 2 and 3', `Evaled is ${ evaled }`);
    });

    it('TestBasicExtendedFunctions', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('6.lg'));
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

        let evaled = lgFile.evaluate('ShowAlarmsWithForeach', { alarms: alarms });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('ShowAlarmsWithLgTemplate', { alarms: alarms });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('ShowAlarmsWithDynamicLgTemplate', { alarms: alarms, templateName: 'ShowAlarm' });
        assert.strictEqual(evaled === 'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow', true, `Evaled is ${ evaled }`);
    });

    it('TestCaseInsensitive', function() {
        let lgFile = Templates.parseFile(GetExampleFilePath('CaseInsensitive.lg'));
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

        let evaled = lgFile.evaluate('ShowAlarms', { alarms: alarms });
        assert.strictEqual(evaled === 'You have two alarms', true, `Evaled is ${ evaled }`);

        let evaled1 = lgFile.evaluate('greetInAWeek', { day: 'Saturday' });
        assert.strictEqual(evaled1 === 'Happy Saturday!', true, `Evaled is ${ evaled1 }`);
    });

    it('TestListWithOnlyOneElement', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('8.lg'));
        var evaled = lgFile.evaluate('ShowTasks', { recentTasks: ['Task1'] });
        assert.strictEqual(evaled === 'Your most recent task is Task1. You can let me know if you want to add or complete a task.', true, `Evaled is ${ evaled }`);
    });

    it('TestTemplateNameWithDotIn', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('TemplateNameWithDot.lg'));
        var evaled1 = lgFile.evaluate('Hello.World', '');
        assert.strictEqual(evaled1 === 'Hello World', true, `Evaled is ${ evaled1 }`);

        var evaled2 = lgFile.evaluate('Hello', '');
        assert.strictEqual(evaled2 === 'Hello World', true, `Evaled is ${ evaled2 }`);
    });

    it('TestMultiLine', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('MultilineTextForAdaptiveCard.lg'));
        var evaled1 = lgFile.evaluate('wPhrase', '');
        var options1 = ['\r\ncardContent\r\n', 'hello', '\ncardContent\n'];
        assert.strictEqual(options1.includes(evaled1), true, `1.Evaled is ${ evaled1 }`);

        var evaled2 = lgFile.evaluate('nameTemplate', { name: 'N' });
        var options2 = ['\r\nN\r\n', 'N', '\nN\n'];
        assert.strictEqual(options2.includes(evaled2), true, `2.Evaled is ${ evaled2 }`);

        var evaled3 = lgFile.evaluate('adaptivecardsTemplate', '');
        console.log(evaled3);

        var evaled4 = lgFile.evaluate('refTemplate', '');
        var options4 = ['\r\nhi\r\n', '\nhi\n'];
        assert.strictEqual(options4.includes(evaled4), true, `4.Evaled is ${ evaled4 }`);
    });

    it('TestTemplateRef', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('TemplateRef.lg'));
        var scope = { time: 'morning', name: 'Dong Lei' };
        var evaled1 = lgFile.evaluate('Hello', scope);
        assert.strictEqual(evaled1, 'Good morning Dong Lei', `Evaled is ${ evaled1 }`);
    });

    it('TestEscapeCharacter', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('EscapeCharacter.lg'));
        var evaled = lgFile.evaluate('wPhrase', undefined);
        assert.strictEqual(evaled, 'Hi \r\n\t[]{}\\', 'Happy path failed.');

        evaled = lgFile.evaluate('otherEscape', undefined);
        assert.strictEqual(evaled, 'Hi y ', 'Happy path failed.');

        evaled = lgFile.evaluate('escapeInExpression', undefined);
        assert.strictEqual(evaled, 'Hi hello\\\\');

        evaled = lgFile.evaluate('escapeInExpression2', undefined);
        assert.strictEqual(evaled, 'Hi hello\'');

        evaled = lgFile.evaluate('escapeInExpression3', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = lgFile.evaluate('escapeInExpression4', undefined);
        assert.strictEqual(evaled, 'Hi hello"');

        evaled = lgFile.evaluate('escapeInExpression5', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = lgFile.evaluate('escapeInExpression6', undefined);
        assert.strictEqual(evaled, 'Hi hello\n');

        evaled = lgFile.evaluate('showTodo', { todos: ['A', 'B', 'C'] });
        assert.strictEqual(evaled.replace(/\r\n/g, '\n'), '\n    Your most recent 3 tasks are\n    * A\n* B\n* C\n    ');

        evaled = lgFile.evaluate('showTodo', undefined);
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
            var lgFile = Templates.parseFile(GetExampleFilePath('Analyzer.lg'));
            var evaled1 = lgFile.analyzeTemplate(testItem.name);
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
        var lgFile = Templates.parseFile(GetExampleFilePath('lgTemplate.lg'));
        var evaled = lgFile.evaluate('TemplateC', '');
        var options = ['Hi', 'Hello'];
        assert.strictEqual(options.includes(evaled), true);

        evaled = lgFile.evaluate('TemplateD', { b: 'morning' });
        options = ['Hi morning', 'Hello morning'];
        assert.strictEqual(options.includes(evaled), true);
    });

    it('TestTemplateAsFunction', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('TemplateAsFunction.lg'));

        var evaled = lgFile.evaluate('Test2');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('Test3');
        assert.strictEqual(evaled, 'hello world', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('Test4');
        assert.strictEqual(evaled.trim(), 'hello world', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('dupNameWithTemplate');
        assert.strictEqual(evaled, 2, `Evaled is ${ evaled }`);
    });

    it('TestAnalyzelgTemplateFunction', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('lgTemplate.lg'));
        var evaled = lgFile.analyzeTemplate('TemplateD');
        var variableEvaled = evaled.Variables;
        var options = ['b'];
        assert.strictEqual(variableEvaled.length, options.length);
        options.forEach(e => assert.strictEqual(variableEvaled.includes(e), true));
    });

    it('TestImportlgFiles', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('importExamples/import.lg'));

        // Assert 6.lg is imported only once when there are several relative paths which point to the same file.
        // Assert import cycle loop is handled well as expected when a file imports itself.
        assert.strictEqual(lgFile.allTemplates.length, 14);

        const options1 = ['Hi', 'Hello', 'Hey'];
        var evaled = lgFile.evaluate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['Hi DongLei :)', 'Hey DongLei :)', 'Hello DongLei :)'];
        evaled = lgFile.evaluate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        const options3 = ['Hi DL :)', 'Hey DL :)', 'Hello DL :)'];
        evaled = lgFile.evaluate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);

        const options4 = ['Hi 2', 'Hello 2'];
        evaled = lgFile.evaluate('basicTemplate2');
        assert.strictEqual(options4.includes(evaled), true, `Evaled is ${ evaled }`);

        const options5 = ['Hi 2', 'Hello 2'];
        evaled = lgFile.evaluate('template3');
        assert.strictEqual(options5.includes(evaled), true, `Evaled is ${ evaled }`);

        // Assert 6.lg of relative path is imported from text.
        lgFile = Templates.parseText(`# basicTemplate\r\n- Hi\r\n- Hello\r\n[import](./6.lg)`, GetExampleFilePath('xx.lg'));

        assert.strictEqual(lgFile.allTemplates.length, 8);

        evaled = lgFile.evaluate('basicTemplate');
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('welcome');
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('welcome', { userName: 'DL' });
        assert.strictEqual(options3.includes(evaled), true, `Evaled is ${ evaled }`);
    });

    it('TestRegex', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('Regex.lg'));
        var evaled = lgFile.evaluate('wPhrase');
        assert.strictEqual(evaled, 'Hi');

        var evaled = lgFile.evaluate('wPhrase', {name: 'jack'});
        assert.strictEqual(evaled, 'Hi jack');

        var evaled = lgFile.evaluate('wPhrase', {name: 'morethanfive'});
        assert.strictEqual(evaled, 'Hi');
    });

    it('TestExpandTemplate', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('Expand.lg'));
        
        // without scope
        var evaled = lgFile.expandTemplate('FinalGreeting');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
        let expectedResults = ['Hi Morning', 'Hi Evening', 'Hello Morning', 'Hello Evening'];
        expectedResults.forEach(x => assert(evaled.includes(x)));

        // with scope
        evaled = lgFile.expandTemplate('TimeOfDayWithCondition', { time: 'evening'});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        expectedResults = ['Hi Evening', 'Hello Evening'];
        expectedResults.forEach(x => assert(evaled.includes(x)));

        // with scope
        evaled = lgFile.expandTemplate('greetInAWeek', {day:'Sunday'});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        expectedResults = ['Nice Sunday!', 'Happy Sunday!'];
        expectedResults.forEach(x => assert(evaled.includes(x)));
    });

    it('TestExpandTemplateWithRef', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('Expand.lg'));
        
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
        
        var evaled = lgFile.expandTemplate('ShowAlarmsWithLgTemplate', {alarms});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        assert.strictEqual(evaled[0], 'You have 2 alarms, they are 8 pm at tomorrow', `Evaled is ${ evaled }`);
        assert.strictEqual(evaled[1], 'You have 2 alarms, they are 8 pm of tomorrow', `Evaled is ${ evaled }`);
    });

    it('TestExpandTemplateWithRefInMultiLine', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('Expand.lg'));
        
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
        
        var evaled = lgFile.expandTemplate('ShowAlarmsWithMultiLine', {alarms});
        assert.strictEqual(evaled.length, 2, `Evaled is ${ evaled }`);
        const eval1Options = ['\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n', '\nYou have 2 alarms.\nThey are 8 pm at tomorrow\n'];
        const eval2Options = ['\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n', '\nYou have 2 alarms.\nThey are 8 pm of tomorrow\n'];
        assert(eval1Options.includes(evaled[0]));
        assert(eval2Options.includes(evaled[1]));
    });

    it('TestExpandTemplateWithFunction', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('Expand.lg'));
        
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
        
        var evaled = lgFile.expandTemplate('ShowAlarmsWithForeach', {alarms});
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        const evalOptions = [
            'You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am at tomorrow and 8 pm of tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm at tomorrow',
            'You have 2 alarms, 7 am of tomorrow and 8 pm of tomorrow'
        ];

        assert(evalOptions.includes(evaled[0]));

        evaled = lgFile.expandTemplate('T2');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = lgFile.expandTemplate('T3');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === '3' || evaled[0] === '5');

        evaled = lgFile.expandTemplate('T4');
        assert.strictEqual(evaled.length, 1, `Evaled is ${ evaled }`);
        assert(evaled[0] === 'ey' || evaled[0] === 'el');
    });

    it('TestInlineEvaluate', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('2.lg'));
        var evaled = lgFile.evaluateText('hello');
        assert.strictEqual('hello', evaled);

        evaled = lgFile.evaluateText('${wPhrase()}');
        var options =[ 'Hi', 'Hello', 'Hiya' ];
        assert.strictEqual(options.includes(evaled), true);

        var errMessage = '';
        try {
            lgFile.evaluateText('${ErrrorTemplate()}');
        } catch (e) {
            errMessage = e.toString();
        }

        assert.strictEqual(errMessage.includes(`it's not a built-in function or a custom function`), true);

    });

    it('TestEvalExpression', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('EvalExpression.lg'));
        const userName = 'MS';
        var evaled = lgFile.evaluate('template1', {userName});
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('template2', {userName});
        assert.strictEqual(evaled, 'Hi MS', `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('template3', {userName});
        assert.strictEqual(evaled, 'HiMS', `Evaled is ${ evaled }`);

        const options1 = ['\r\nHi MS\r\n', '\nHi MS\n'];
        evaled = lgFile.evaluate('template4', { userName});
        assert.strictEqual(options1.includes(evaled), true, `Evaled is ${ evaled }`);

        const options2 = ['\r\nHiMS\r\n', '\nHiMS\n'];
        evaled = lgFile.evaluate('template5', { userName});
        assert.strictEqual(options2.includes(evaled), true, `Evaled is ${ evaled }`);

        evaled = lgFile.evaluate('template6', {userName});
        assert.strictEqual(evaled, 'goodmorning', `Evaled is ${ evaled }`);
    });


    it('TestLGResource', function() {
        var lgResource = Templates.parseText(fs.readFileSync(GetExampleFilePath('2.lg'), 'utf-8'));

        assert.strictEqual(lgResource.items.length, 1);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.items[0].name, 'wPhrase');
        assert.strictEqual(lgResource.items[0].body.replace(/\r\n/g, '\n'), '> this is an in-template comment\n- Hi\n- Hello\n- Hiya\n- Hi');

        lgResource = lgResource.addTemplate('newtemplate', ['age', 'name'], '- hi ');
        assert.strictEqual(lgResource.items.length, 2);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.items[1].name, 'newtemplate');
        assert.strictEqual(lgResource.items[1].parameters.length, 2);
        assert.strictEqual(lgResource.items[1].parameters[0], 'age');
        assert.strictEqual(lgResource.items[1].parameters[1], 'name');
        assert.strictEqual(lgResource.items[1].body.replace(/\r\n/g, '\n'), '- hi \n');

        lgResource = lgResource.addTemplate('newtemplate2', undefined, '- hi2 ');
        assert.strictEqual(lgResource.items.length, 3);
        assert.strictEqual(lgResource.items[2].name, 'newtemplate2');
        assert.strictEqual(lgResource.items[2].body.replace(/\r\n/g, '\n'), '- hi2 \n');

        lgResource = lgResource.updateTemplate('newtemplate', 'newtemplateName', ['newage', 'newname'], '- new hi\r\n#hi');
        assert.strictEqual(lgResource.items.length, 3);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.items[1].name, 'newtemplateName');
        assert.strictEqual(lgResource.items[1].parameters.length, 2);
        assert.strictEqual(lgResource.items[1].parameters[0], 'newage');
        assert.strictEqual(lgResource.items[1].parameters[1], 'newname');
        assert.strictEqual(lgResource.items[1].body.replace(/\r\n/g, '\n'), '- new hi\n- #hi\n');

        lgResource = lgResource.updateTemplate('newtemplate2', 'newtemplateName2', ['newage2', 'newname2'], '- new hi\r\n#hi2');
        assert.strictEqual(lgResource.items.length, 3);
        assert.strictEqual(lgResource.imports.length, 0);
        assert.strictEqual(lgResource.items[2].name, 'newtemplateName2');
        assert.strictEqual(lgResource.items[2].body.replace(/\r\n/g, '\n'), '- new hi\n- #hi2\n');

        lgResource = lgResource.deleteTemplate('newtemplateName');
        assert.strictEqual(lgResource.items.length, 2);

        lgResource = lgResource.deleteTemplate('newtemplateName2');
        assert.strictEqual(lgResource.items.length, 1);
    });

    it('TestMemoryScope', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('MemoryScope.lg'));
        var evaled = lgFile.evaluate('T1', { turn: { name: 'Dong', count: 3 } });
        assert.strictEqual(evaled, 'Hi Dong, welcome to Seattle, Seattle is a beautiful place, how many burgers do you want, 3?');

        const objscope = {
            schema: {
                Bread: {
                    enum: ['A', 'B']
                }
            }
        };
        var scope = new SimpleObjectMemory(objscope);
         
        evaled = lgFile.evaluate('AskBread', scope);
        assert.strictEqual(evaled, 'Which Bread, A or B do you want?');
    });

    it('TestStructuredTemplate', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('StructuredTemplate.lg'));

        var evaled = lgFile.evaluate('AskForAge.prompt');
        assert.equal(evaled.text, evaled.speak);

        evaled = lgFile.evaluate('AskForAge.prompt2');
        if (evaled.text.includes('how old')){
            assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"how old are you?","suggestedactions":["10","20","30"]}'));
        } else {
            assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"what\'s your age?","suggestedactions":["10","20","30"]}'));
        }

        evaled = lgFile.evaluate('AskForAge.prompt3');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"${GetAge()}","suggestions":["10 | cards","20 | cards"]}'));

        evaled = lgFile.evaluate('T1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"This is awesome","speak":"foo bar I can also speak!"}'));

        evaled = lgFile.evaluate('ST1');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"foo","speak":"bar"}'));

        evaled = lgFile.evaluate('AskForColor');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","suggestedactions":[{"lgType":"MyStruct","speak":"bar","text":"zoo"},{"lgType":"Activity","speak":"I can also speak!"}]}'));

        evaled = lgFile.evaluate('MultiExpression');
        assert.equal(evaled, '{"lgType":"Activity","speak":"I can also speak!"} {"lgType":"MyStruct","text":"hi"}');

        evaled = lgFile.evaluate('StructuredTemplateRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","text":"hi"}'));

        evaled = lgFile.evaluate('MultiStructuredRef');
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"MyStruct","list":[{"lgType":"SubStruct","text":"hello"},{"lgType":"SubStruct","text":"world"}]}'));

        evaled = lgFile.evaluate('templateWithSquareBrackets', {manufacturer: {Name : 'Acme Co'}});
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Struct","text":"Acme Co"}'));

        evaled = lgFile.evaluate('ValueWithEqualsMark', {name : 'Jack'});
        assert.deepStrictEqual(evaled, JSON.parse('{"lgType":"Activity","text":"Hello! welcome back. I have your name = Jack"}'));
    });

    it('TestEvaluateOnce', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('EvaluateOnce.lg'));

        var evaled = lgFile.evaluate('templateWithSameParams', { param: 'ms' });
        assert.notEqual(evaled, undefined);
        
        const resultList = evaled.split(' ');
        assert.equal(resultList.length, 2);

        assert.equal(resultList[0], resultList[1]);

        // maybe has different values
        evaled = lgFile.evaluate('templateWithDifferentParams', { param1: 'ms', param2: 'newms' });
    });

    it('TestConditionExpression', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('ConditionExpression.lg'));

        var evaled = lgFile.evaluate('conditionTemplate', { num: 1 });
        assert.equal(evaled, 'Your input is one');
        
        evaled = lgFile.evaluate('conditionTemplate', { num: 2 });
        assert.equal(evaled, 'Your input is two');

        evaled = lgFile.evaluate('conditionTemplate', { num: 3 });
        assert.equal(evaled, 'Your input is three');

        evaled = lgFile.evaluate('conditionTemplate', { num: 4 });
        assert.equal(evaled, 'Your input is not one, two or three');
    });

    it('TestExpandTemplateWithStructuredLG', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('StructuredTemplate.lg'));

        var evaled = lgFile.expandTemplate('AskForAge.prompt');
        assert.strictEqual(evaled.length, 4, `Evaled is ${ evaled }`);
    
        let expectedResults = [
            '{"lgType":"Activity","text":"how old are you?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"how old are you?","speak":"what\'s your age?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"how old are you?"}',
            '{"lgType":"Activity","text":"what\'s your age?","speak":"what\'s your age?"}'
        ];
        expectedResults.forEach( u => assert(evaled.includes(u)));

        evaled = lgFile.expandTemplate('ExpanderT1');
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
        var lgFile = Templates.parseFile(GetExampleFilePath('ExpressionExtract.lg'));

        var evaled1 = lgFile.evaluate('templateWithBrackets');
        var evaled2 = lgFile.evaluate('templateWithBrackets2');
        var evaled3 = lgFile.evaluate('templateWithBrackets3').toString().trim();
        let espectedResult = 'don\'t mix {} and \'{}\'';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = lgFile.evaluate('templateWithQuotationMarks');
        evaled2 = lgFile.evaluate('templateWithQuotationMarks2');
        evaled3 = lgFile.evaluate('templateWithQuotationMarks3').toString().trim();
        espectedResult = 'don\'t mix {"} and ""\'"';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
        
        evaled1 = lgFile.evaluate('templateWithUnpairedBrackets1');
        evaled2 = lgFile.evaluate('templateWithUnpairedBrackets12');
        evaled3 = lgFile.evaluate('templateWithUnpairedBrackets13').toString().trim();
        espectedResult = '{prefix 5 sufix';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);

        evaled1 = lgFile.evaluate('templateWithUnpairedBrackets2');
        evaled2 = lgFile.evaluate('templateWithUnpairedBrackets22');
        evaled3 = lgFile.evaluate('templateWithUnpairedBrackets23').toString().trim();
        espectedResult = 'prefix 5 sufix}';
        assert.strictEqual(evaled1, espectedResult);
        assert.strictEqual(evaled2, espectedResult);
        assert.strictEqual(evaled3, espectedResult);
    });

    it('TestEmptyArrayAndObject', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('EmptyArrayAndObject.lg'));

        var evaled = lgFile.evaluate('template', {list:[], obj: {}});
        assert.strictEqual(evaled, 'list and obj are both empty');

        evaled = lgFile.evaluate('template', {list:[], obj:new Map()});
        assert.strictEqual(evaled, 'list and obj are both empty');

        evaled = lgFile.evaluate('template', {list:['hi'], obj: {}});
        assert.strictEqual(evaled, 'obj is empty');

        evaled = lgFile.evaluate('template', {list:[], obj: {a: 'a'}});
        assert.strictEqual(evaled, 'list is empty');

        const map = new Map();
        map.set('a', 'a');
        evaled = lgFile.evaluate('template', {list:[], obj: map});
        assert.strictEqual(evaled, 'list is empty');

        evaled = lgFile.evaluate('template', {list:[{}], obj : {a : 'a'}});
        assert.strictEqual(evaled, 'list and obj are both not empty.');        
    });

    it('TestNullTolerant', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('NullTolerant.lg'));

        var evaled = lgFile.evaluate('template1');
        assert.strictEqual('null', evaled);

        evaled = lgFile.evaluate('template2');
        assert.strictEqual(`result is 'null'`, evaled);

        var jObjEvaled = lgFile.evaluate('template3');
        assert.strictEqual('null', jObjEvaled['key1']);

    });


    it('TestIsTemplateFunction', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('IsTemplate.lg'));

        var evaled = lgFile.evaluate('template2', {templateName:'template1'});
        assert.strictEqual(evaled, 'template template1 exists');

        evaled = lgFile.evaluate('template2', {templateName:'wPhrase'});
        assert.strictEqual(evaled, 'template wPhrase exists');

        evaled = lgFile.evaluate('template2', {templateName:'xxx'});
        assert.strictEqual(evaled, 'template xxx does not exist'); 
    });

    it('TestStringInterpolation', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('StringInterpolation.lg'));

        var evaled = lgFile.evaluate('simpleStringTemplate');
        assert.strictEqual(evaled, 'say hi');

        evaled = lgFile.evaluate('StringTemplateWithVariable', {w:'world'});
        assert.strictEqual(evaled, 'hello world');

        evaled = lgFile.evaluate('StringTemplateWithMixing', {name:'jack'});
        assert.strictEqual(evaled, 'I know your name is jack'); 

        evaled = lgFile.evaluate('StringTemplateWithJson', {h:'hello', w: 'world'});
        assert.strictEqual(evaled, 'get \'h\' value : hello');

        evaled = lgFile.evaluate('StringTemplateWithEscape');
        assert.strictEqual(evaled, 'just want to output ${bala\`bala}'); 

        evaled = lgFile.evaluate('StringTemplateWithTemplateRef');
        assert.strictEqual(evaled, 'hello jack , welcome. nice weather!'); 
    });

    it('TestMemoryAccessPath', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('MemoryAccess.lg'));

        const scope = {
            myProperty: {
                name: 'p1'
            },
            turn: {
                properties: {
                    p1: {
                        enum: 'p1enum'
                    }
                }
            }
        };

        // this evaulate will hit memory access twice
        // first for "property", and get "p1", from local
        // sencond for "turn.property[p1].enum" and get "p1enum" from global
        var evaled = lgFile.evaluate('T1', scope);
        assert.strictEqual(evaled, 'p1enum');

        // this evaulate will hit memory access twice
        // first for "myProperty.name", and get "p1", from global
        // sencond for "turn.property[p1].enum" and get "p1enum" from global 
        evaled = lgFile.evaluate('T3', scope);
        assert.strictEqual(evaled, 'p1enum');
    });

    it('TestReExecute', function() {
        var lgFile = Templates.parseFile(GetExampleFilePath('ReExecute.lg'));

        // may be has different values
        lgFile.evaluate('templateWithSameParams', {param1:'ms', param2:'newms'});
    });

    it('TestCustomFunction', function() {
        let parser = new ExpressionParser((func) => {
            if (func === 'custom') {
                return ExpressionFunctions.numeric('custom', 
                    args => {
                        return args[0] + args[1];
                    });
            } else {
                return Expression.lookup(func);
            }
        });
        let lgFile = Templates.parseFile(GetExampleFilePath('CustomFunction.lg'), undefined, parser);
        assert.equal(lgFile.expressionParser, parser);
        let result = lgFile.evaluate('template', {});
        assert.strictEqual(result, 3);
        result = lgFile.evaluate('callSub', {});
        assert.strictEqual(result, 12);
    });
});
