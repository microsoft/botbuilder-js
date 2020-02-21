const { LGParser, DiagnosticSeverity } = require(`../`);
const assert = require(`assert`);
const fs = require(`fs`);

function GetExceptionExampleFilePath(fileName) {
    return `${ __dirname }/testData/exceptionExamples/` + fileName;
}

function GetLGFile(fileName) {
    var filePath = GetExceptionExampleFilePath(fileName);
    return LGParser.parseFile(filePath);
}

function GetDiagnostics(fileName) {
    var filePath = GetExceptionExampleFilePath(fileName);
    return LGParser.parseFile(filePath).diagnostics;
}

describe(`LGExceptionTest`, function() {
    it(`TestConditionFormatError`, function() {
        var diagnostics = GetDiagnostics(`ConditionFormatError.lg`);
        assert.strictEqual(diagnostics.length, 10);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert.strictEqual(diagnostics[0].message.includes(`condition is not end with else`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`if and elseif should followed by one valid expression`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(`condition can not have more than one if`), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[3].severity);
        assert.strictEqual(diagnostics[3].message.includes(`condition is not end with else`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
        assert.strictEqual(diagnostics[4].message.includes(`else should not followed by any expression`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[5].severity);
        assert.strictEqual(diagnostics[5].message.includes(`condition can not have more than one if`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
        assert.strictEqual(diagnostics[6].message.includes(`only elseif is allowed in middle of condition`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
        assert.strictEqual(diagnostics[7].message.includes(`At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[8].severity);
        assert.strictEqual(diagnostics[8].message.includes(`At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :`), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[9].severity);
        assert.strictEqual(diagnostics[9].message.includes(`condition is not start with i`), true);
    });

    it(`TestDuplicatedTemplates`, function() {
        var diagnostics = GetDiagnostics(`DuplicatedTemplates.lg`);

        assert.strictEqual(2, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`Duplicated definitions found for template: template1`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`Duplicated definitions found for template: template1`), true);

        var lgFile = GetLGFile(`DuplicatedTemplates.lg`);
        var allDiagnostics = lgFile.allDiagnostics;

        assert.strictEqual(4, allDiagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[0].severity);
        assert.strictEqual(allDiagnostics[0].message.includes(`Duplicated definitions found for template: template1`), true);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[1].severity);
        assert.strictEqual(allDiagnostics[1].message.includes(`Duplicated definitions found for template: template1`), true);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[2].severity);
        assert.strictEqual(allDiagnostics[2].message.includes(`Duplicated definitions found for template: basicTemplate`), true);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[3].severity);
        assert.strictEqual(allDiagnostics[3].message.includes(`Duplicated definitions found for template: basicTemplate2`), true);
    });

    it(`TestDuplicatedTemplatesInImportFiles`, function() {
        var diagnostics = GetDiagnostics(`DuplicatedTemplatesInImportFiles.lg`);

        assert.strictEqual(2, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`Duplicated definitions found for template: basicTemplate`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`Duplicated definitions found for template: basicTemplate2`), true);
    });

    it(`TestEmptyLGFile`, function() {
        var diagnostics = GetDiagnostics(`EmptyTemplate.lg`);

        assert.strictEqual(1, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`There is no template body in template template`), true);
    });

    it(`TestErrorStructuredTemplate`, function() {
        var diagnostics = GetDiagnostics(`ErrorStructuredTemplate.lg`);

        assert.strictEqual(5, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`Structured body format error`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`Structured content is empty`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(`does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[3].severity);
        assert.strictEqual(diagnostics[3].message.includes(`does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
        assert.strictEqual(diagnostics[4].message.includes(`Structured name format error`), true);
    });

    it(`TestErrorTemplateName`, function() {
        var diagnostics = GetDiagnostics(`ErrorTemplateName.lg`);

        assert.strictEqual(5, diagnostics.length);
        for(const diagnostic of diagnostics)
        {
            assert.strictEqual(DiagnosticSeverity.Error, diagnostic.severity);
            assert.strictEqual(diagnostic.message.includes(`Not a valid template name line`), true);
        }
    });

    it(`TestInvalidLGFileImportPath`, function() {
        var diagnostics = GetDiagnostics(`InvalidLGFileImportPath.lg`);

        assert.strictEqual(1, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`Could not find file`), true);
    });

    it(`TestLgTemplateFunctionError`, function() {
        var diagnostics = GetDiagnostics(`LgTemplateFunctionError.lg`);

        assert.strictEqual(2, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`arguments mismatch for template`), true);
    });

    it(`TestMultiLineVariation`, function() {
        var diagnostics = GetDiagnostics(`MultiLineVariation.lg`);

        assert.strictEqual(1, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes('Close ``` is missing'), true);
    });

    it(`TestNoNormalTemplateBody`, function() {
        var diagnostics = GetDiagnostics(`NoNormalTemplateBody.lg`);

        assert.strictEqual(3, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`condition is not end with else`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`no normal template body in condition block`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(`no normal template body in condition block`), true);
    });

    it(`TestNoTemplateRef`, function() {
        var diagnostics = GetDiagnostics(`NoTemplateRef.lg`);

        assert.strictEqual(3, diagnostics.length);

        for(const diagnostic of diagnostics) {
            assert.strictEqual(DiagnosticSeverity.Error, diagnostic.severity);
            assert.strictEqual(diagnostic.message.includes(`does not have an evaluator`), true);
        }
    });

    it(`TestSwitchCaseFormatError`, function() {
        var diagnostics = GetDiagnostics(`SwitchCaseFormatError.lg`);

        assert.strictEqual(14, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`At most 1 whitespace is allowed between SWITCH/CASE/DEFAULT and :.`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`control flow can not have more than one switch statement`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(`control flow is not starting with switch`), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[3].severity);
        assert.strictEqual(diagnostics[3].message.includes(`control flow should have at least one case statement`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
        assert.strictEqual(diagnostics[4].message.includes(`only case statement is allowed in the middle of control flow`), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[5].severity);
        assert.strictEqual(diagnostics[5].message.includes(`control flow is not ending with default statement`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
        assert.strictEqual(diagnostics[6].message.includes(`default should not followed by any expression or any text`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
        assert.strictEqual(diagnostics[7].message.includes(`no normal template body in case or default block`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[8].severity);
        assert.strictEqual(diagnostics[8].message.includes(`default should not followed by any expression or any text`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[9].severity);
        assert.strictEqual(diagnostics[9].message.includes(`no normal template body in case or default block`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[10].severity);
        assert.strictEqual(diagnostics[10].message.includes(`switch and case should followed by one valid expression`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[11].severity);
        assert.strictEqual(diagnostics[11].message.includes(`default should not followed by any expression or any text`), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[12].severity);
        assert.strictEqual(diagnostics[12].message.includes(`control flow should have at least one case statement`), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[13].severity);
        assert.strictEqual(diagnostics[13].message.includes(`control flow is not ending with default statement`), true);
    });

    it(`TestLoopDetected`, function() {
        var lgFile = GetLGFile(`LoopDetected.lg`);
        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`wPhrase`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }

        assert.strictEqual(isSuccessful, false);
        assert.strictEqual(errorMessage.includes(`Loop detected`), true);
        

        try {
            lgFile.analyzeTemplate(`wPhrase`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }

        assert.strictEqual(isSuccessful, false);
        assert.strictEqual(errorMessage.includes(`Loop detected`), true);
    });

    it(`AddTextWithWrongId`, function() {
        var diagnostics = LGParser.parseText(`[import](xx.lg) \r\n # t \n - hi`, `a.lg`).diagnostics;
        assert.strictEqual(1, diagnostics.length);
        //assert.strictEqual(diagnostics[0].message.includes(`Could not find file`), true);
    });

    it(`TestErrorExpression`, function() {
        var lgFile = GetLGFile(`ErrorExpression.lg`);
        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`template1`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }

        assert.strictEqual(isSuccessful, false);
        assert.strictEqual(errorMessage.includes(`Error occurs when evaluating expression`), true);
    });

});