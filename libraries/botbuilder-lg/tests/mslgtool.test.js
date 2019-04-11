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
        assert.strictEqual(errors.length, 2);
        assert.strictEqual(errors[0], "[ERROR]: There is no template body in template template");
        var warnOptions = ["[WARN]: condition is not end with else: \'-IF:{foo == \'bar\'}\r\n-ok<EOF>\'",
                            "[WARN]: condition is not end with else: \'-IF:{foo == \'bar\'}\n-ok<EOF>\'"]
        assert(warnOptions.includes(errors[1]));
    });

    it('TestValidateReturnAntlrParseError', function () {
        let errors = new MSLGTool().ValidateFile(GetExampleFile('AntlrParseError.lg'));
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], "[ERROR]: syntax error at line 2:18 mismatched input 'param2' expecting {<EOF>, NEWLINE}");
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
        assert.strictEqual(mslgTool.CollatedTemplates.size, 4);
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
        assert.strictEqual(expandedTemplate[0], "\r\nYou have 2 alarms.\r\nThey are 8 pm at tomorrow\r\n");
        assert.strictEqual(expandedTemplate[1], "\r\nYou have 2 alarms.\r\nThey are 8 pm of tomorrow\r\n");
    })
})