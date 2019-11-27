const { TemplateEngine, StaticChecker, DiagnosticSeverity } = require('../');
const assert = require('assert');

function GetExampleFilePath(fileName){
    return `${ __dirname }/testData/exceptionExamples/`+ fileName;
}

const StaticCheckExceptionData  = [
    'MultilineVariation.lg',
    'ErrorTemplateParameters.lg',
    'NoNormalTemplateBody.lg',
    'ConditionFormatError.lg',
    'NoTemplateRef.lg',
    'TemplateParamsNotMatchArgsNum.lg',
    'ErrorSeperateChar.lg',
    'ErrorSeperateChar2.lg',
    'MultilineVariation.lg',
    'InvalidTemplateName.lg',
    'InvalidTemplateName2.lg',
    'DuplicatedTemplates.lg',
    'LgTemplateFunctionError.lg',
    'SwitchCaseFormatError.lg',
    'InvalidLGFileImportPath.lg',
    'DuplicatedTemplatesInImportFiles.lg',
    'ErrorStructuredTemplate.lg'
];

const StaticCheckWariningData  = [
    'EmptyLGFile.lg',
    'OnlyNoMatchRule.lg',
    'NoMatchRule.lg',
    'SwitchCaseWarning.lg',
    'EmptyTemplate.lg',
];

const AnalyzerExceptionData   = [
    ['LoopDetected.lg','NotExistTemplateName'],
    ['LoopDetected.lg','wPhrase'],
];


const EvaluatorExceptionData    = [
    ['ErrorExpression.lg','template1'],
    ['LoopDetected.lg','wPhrase'],
    ['LoopDetected.lg','NotExistTemplate'],
];


describe('LGExceptionTest', function() {
    
    it('WariningTest', function() {
        for (const testDateItem of StaticCheckWariningData ) {
            var engine = new TemplateEngine().addFile(GetExampleFilePath(testDateItem));
            var report = new StaticChecker().checkTemplates(engine.templates);
            assert.strictEqual(report.length > 0, true);
            report.forEach(e => assert.strictEqual(e.severity === DiagnosticSeverity.Warning, true));
        }
    });

    it('ThrowExceptionTest', function() {
        for (const testDateItem of StaticCheckExceptionData ) {
            var isFail = false;
            try {
                new TemplateEngine().addFile(GetExampleFilePath(testDateItem));
                isFail = true;
            } catch (e) {
                console.log(e.message);
            }

            if (isFail) {
                assert.fail('should throw error.');
            }    
        }
    });

    it('AnalyzerThrowExceptionTest', function() {
        for (const testDateItem of AnalyzerExceptionData ) {
            var isFail = false;
            var errorMessage = '';
            var engine;
            try {
                engine = new TemplateEngine().addFile(GetExampleFilePath(testDateItem[0]));
            } catch (e) {
                isFail = true;
                errorMessage = 'error occurs when parsing file';
            }

            if(!isFail) {
                try {
                    engine.AnalyzeTemplate(testDateItem[1]);
                    isFail = true;
                    errorMessage = 'No exception is thrown.';
                } catch (e) {
                    errorMessage = e.message;
                }
            }

            if (isFail) {
                assert.fail(errorMessage);
            }    
        }
    });
    
    it('EvaluatorThrowExceptionTest', function() {
        for (const testDateItem of EvaluatorExceptionData ) {
            var isFail = false;
            var errorMessage = '';
            var engine;
            try {
                engine = new TemplateEngine().addFile(GetExampleFilePath(testDateItem[0]));
            } catch (e) {
                isFail = true;
                errorMessage = 'error occurs when parsing file';
            }

            if(!isFail) {
                try {
                    engine.EvaluateTemplate(testDateItem[1]);
                    isFail = true;
                    errorMessage = 'No exception is thrown.';
                } catch (e) {
                    errorMessage = e.message;
                }
            }

            if (isFail) {
                assert.fail(errorMessage);
            }    
        }
    });

    it('AddTextWithWrongId', function() {
        assert.throws(() => { new TemplateEngine().addText('# t \n - hi', 'a.lg'); }, Error);
    });
});