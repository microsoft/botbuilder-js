const {TemplateEngine, StaticChecker, ReportEntryType } = require('../');
const assert = require('assert');

function GetExampleFilePath(fileName){
    return `${ __dirname }/testData/exceptionExamples/`+ fileName;
}

const ExceptionDataFiles = [
    "EmptyTemplate.lg",
    "ErrorTemplateParameters.lg",
    "NoNormalTemplateBody.lg",
    "ConditionFormatError.lg",
    "ErrorEscapeCharacter.lg",
    "NoTemplateRef.lg",
    "TemplateParamsNotMatchArgsNum.lg",
    "ErrorSeperateChar.lg",
    "ErrorSeperateChar2.lg",
    "MultilineVariation.lg",
    "InvalidTemplateName.lg",
    "InvalidTemplateName2.lg"
    ];

const WarningDataFiles = [
    "EmptyLGFile.lg",
    "OnlyNoMatchRule.lg",
    "NoMatchRule.lg"
];

describe('LGExceptionTest', function () {
    
    it('WariningTest', function () {
        for (const testDateItem of WarningDataFiles) {
            var engine = TemplateEngine.fromFiles(GetExampleFilePath(testDateItem));
            var report = new StaticChecker(engine.templates).Check();
            assert.strictEqual(report.length > 0, true);
            report.forEach(e => assert.strictEqual(e.Type === ReportEntryType.WARN, true));
        }
    });

    it('ThrowExceptionTest', function () {
        for (const testDateItem of ExceptionDataFiles) {
            var isFail = false;
            try
            {
                TemplateEngine.fromFiles(GetExampleFilePath(testDateItem));
                isFail = true;
            }
            catch (e)
            {
                console.log(e.message);
            }

            if (isFail)
            {
                assert.fail("should throw error.");
            }    
        }
    });
    
});