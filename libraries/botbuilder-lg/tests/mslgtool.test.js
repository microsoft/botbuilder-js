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
        assert.strictEqual(errors[1], "[WARN]: condition is not end with else: \'-IF:{foo == \'bar\'}\r\n-ok<EOF>\'");
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

    it('TestMergeTemplates', function () {
        const mslgTool = new MSLGTool();
        let errors = mslgTool.ValidateFile(GetExampleFile('CollateFile1.lg'));
        assert.strictEqual(errors.length, 0);
        errors = mslgTool.ValidateFile(GetExampleFile('CollateFile2.lg'));
        assert.strictEqual(errors.length, 0);
        errors = mslgTool.ValidateFile(GetExampleFile('CollateFile3.lg'));
        assert.strictEqual(errors.length, 0);
        assert.strictEqual(mslgTool.MergerMessages.length, 0);
        assert.strictEqual(mslgTool.NameCollisions.length, 3);
        assert.strictEqual(mslgTool.MergedTemplates.size, 4);
        assert.strictEqual(mslgTool.MergedTemplates.get('Greeting').length, 3);
        assert.strictEqual(mslgTool.MergedTemplates.get('TimeOfDayWithCondition').size, 3);
        assert.strictEqual(mslgTool.MergedTemplates.get('TimeOfDay').length, 3);
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
})