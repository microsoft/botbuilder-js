const { MSLGTool } = require('../');
const assert = require('assert');
const fs = require('fs');

function GetExampleFile(fileName){
    const text = fs.readFileSync(`${ __dirname }/testData/mslgTool/`+ fileName, 'utf-8');
    return text;
}

describe('MSLGTool', function () {
    it('TestValidateReturnStaticCheckerErrors', function () {
        let errors = new MSLGTool().ValidateFile(GetExampleFile('StaticCheckerErrors.lg'));
        let regexp = new RegExp('\r\n', 'g');
        assert.strictEqual(errors.length,5)
        assert.strictEqual(errors[0], "[Error] line 1:0 - line 1:10: error message: There is no template body in template template");
        assert.strictEqual(errors[1].replace(regexp, '\n'), "[Warning] line 5:0 - line 5:20: error message: condition is not end with else: \'-IF:{foo == \'bar\'}\n-ok\n\'")
        assert.strictEqual(errors[2].replace(regexp, '\n'), "[Error] line 9:0 - line 9:14: error message: control flow is not starting with switch: \'-CASE:{\'bar\'}\n-bar   \n\'")
        assert.strictEqual(errors[3].replace(regexp, '\n'), "[Warning] line 9:0 - line 9:14: error message: control flow is not ending with default statement: \'-CASE:{\'bar\'}\n-bar   \n\'")
        assert.strictEqual(errors[4].replace(regexp, '\n'), "[Warning] line 14:0 - line 14:10: error message: control flow should have at least one case statement: \'-SWITCH:{foo}\n-default:\n-bar<EOF>\'")
    });

    it('TestValidateReturnAntlrParseError', function () {
        let errors = new MSLGTool().ValidateFile(GetExampleFile('AntlrParseError.lg'));
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], "[Error] line 1:18 - line 1:24: syntax error message: mismatched input 'param2' expecting {<EOF>, NEWLINE}");
    });

    it('TestValidateReturnNoErrors', function () {
        let errors = new MSLGTool().ValidateFile(GetExampleFile('ValidFile.lg'));
        assert.strictEqual(errors.length, 0);
    });

    it('TestCollateTemplates', function () {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('CollateFile1.lg'));
        assert.strictEqual(errors.length, 0);
        errors = mslgTool.ValidateFile(GetExampleFile('CollateFile2.lg'));
        assert.strictEqual(errors.length, 0);
        errors = mslgTool.ValidateFile(GetExampleFile('CollateFile3.lg'));
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(mslgTool.CollationMessages.length, 0);
        assert.strictEqual(mslgTool.NameCollisions.length, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.size, 5);
        assert.strictEqual(mslgTool.CollatedTemplates.get('Greeting').length, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.get('TimeOfDayWithCondition').size, 3);
        assert.strictEqual(mslgTool.CollatedTemplates.get('TimeOfDay').length, 3);
    });

    it('TestExpandTemplate', function () {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('CollateFile1.lg'));
        assert.strictEqual(errors.length, 0);
        let expandedTemplate = mslgTool.ExpandTemplate('FinalGreeting', undefined);
        assert.strictEqual(expandedTemplate.length, 4);
        let expectedResults = ['Hi Morning', 'Hi Evening', 'Hello Morning', 'Hello Evening'];
        expectedResults.forEach(element => {
            assert.strictEqual(expandedTemplate.includes(element), true);
        });
    })

    it('TestExpandTemplateWithScope', function() {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('CollateFile3.lg'));
        assert.strictEqual(errors.length, 0);
        let expandedTemplate = mslgTool.ExpandTemplate('TimeOfDayWithCondition', { time: 'evening' });
        assert.strictEqual(expandedTemplate.length, 2);
        let expectedResults = ['Hi Evening', 'Hey Evening'];
        expectedResults.forEach(element => {
            assert.strictEqual(expandedTemplate.includes(element), true);
        });
        let expandedTemplate2 = mslgTool.ExpandTemplate('greetInAWeek', { day: 'Sunday' });
        assert.strictEqual(expandedTemplate.length, 2);
        let expected2Results = ['Nice Sunday!', 'Happy Sunday!'];
        expected2Results.forEach(element => {
            assert.strictEqual(expandedTemplate2.includes(element), true);
        });

    })

    it('TestExpandTemplateWithRef', function() {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('ValidFile.lg'));
        assert.strictEqual(errors.length, 0);
        const alarms = [
            {
                time: "7 am",
                date : "tomorrow"
            },
            {
                time:"8 pm",
                date :"tomorrow"
            }
        ];
        let expandedTemplate = mslgTool.ExpandTemplate('ShowAlarmsWithLgTemplate', {alarms: alarms});
        assert.strictEqual(expandedTemplate.length, 2);
        assert.strictEqual(expandedTemplate[0], "You have 2 alarms, they are 8 pm at tomorrow");
        assert.strictEqual(expandedTemplate[1], "You have 2 alarms, they are 8 pm of tomorrow");
    })

    it('TestExpandTemplateWithRefInForeach', function() {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('ValidFile.lg'));
        assert.strictEqual(errors.length, 0);
        const alarms = [
            {
                time: "7 am",
                date : "tomorrow"
            },
            {
                time:"8 pm",
                date :"tomorrow"
            }
        ];
        let expandedTemplate = mslgTool.ExpandTemplate('ShowAlarmsWithForeach', {alarms: alarms});
        assert.strictEqual(expandedTemplate.length, 1);
        assert.strictEqual(expandedTemplate[0], "You have 2 alarms, 7 am at tomorrow and 8 pm at tomorrow")
    })

    it('TestExpandTemplateWithRefInMultiLine', function() {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('ValidFile.lg'));
        assert.strictEqual(errors.length, 0);
        const alarms = [
            {
                time: "7 am",
                date : "tomorrow"
            },
            {
                time:"8 pm",
                date :"tomorrow"
            }
        ];
        let expandedTemplate = mslgTool.ExpandTemplate('ShowAlarmsWithMultiLine', {alarms: alarms});
        assert.strictEqual(expandedTemplate.length, 2);
        const eval1Options = ["\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n", "\nYou have 2 alarms.\nThey are 8 pm at tomorrow\n"];
        const eval2Options = ["\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n", "\nYou have 2 alarms.\nThey are 8 pm of tomorrow\n"]
        assert(eval1Options.includes(expandedTemplate[0]));
        assert(eval2Options.includes(expandedTemplate[1]));
    })
})