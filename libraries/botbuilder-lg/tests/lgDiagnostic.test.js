const { LGParser, DiagnosticSeverity, LGErrors } = require(`../`);
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
    // it(`TestConditionFormatError`, function() {
    //     var diagnostics = GetDiagnostics(`ConditionFormatError.lg`);
    //     assert.strictEqual(diagnostics.length, 10);
    //     assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.notEndWithElseInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(LGErrors.invalidExpressionInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
    //     assert.strictEqual(diagnostics[2].message.includes(LGErrors.multipleIfInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[3].severity);
    //     assert.strictEqual(diagnostics[3].message.includes(LGErrors.notEndWithElseInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
    //     assert.strictEqual(diagnostics[4].message.includes(LGErrors.extraExpressionInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[5].severity);
    //     assert.strictEqual(diagnostics[5].message.includes(LGErrors.multipleIfInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
    //     assert.strictEqual(diagnostics[6].message.includes(LGErrors.invalidMiddleInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
    //     assert.strictEqual(diagnostics[7].message.includes(LGErrors.invalidWhitespaceInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[8].severity);
    //     assert.strictEqual(diagnostics[8].message.includes(LGErrors.invalidWhitespaceInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[9].severity);
    //     assert.strictEqual(diagnostics[9].message.includes(LGErrors.notStartWithIfInCondition), true);
    // });

    // it(`TestDuplicatedTemplates`, function() {
    //     var diagnostics = GetDiagnostics(`DuplicatedTemplates.lg`);

    //     assert.strictEqual(2, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.duplicatedTemplateInSameTemplate('template1')), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(LGErrors.duplicatedTemplateInSameTemplate('template1')), true);

    //     var lgFile = GetLGFile(`DuplicatedTemplates.lg`);
    //     var allDiagnostics = lgFile.allDiagnostics;

    //     assert.strictEqual(4, allDiagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[0].severity);
    //     assert.strictEqual(allDiagnostics[0].message.includes(LGErrors.duplicatedTemplateInSameTemplate('template1')), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[1].severity);
    //     assert.strictEqual(allDiagnostics[1].message.includes(LGErrors.duplicatedTemplateInSameTemplate('template1')), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[2].severity);
    //     assert.strictEqual(allDiagnostics[2].message.includes(`Duplicated definitions found for template: 'basicTemplate'`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[3].severity);
    //     assert.strictEqual(allDiagnostics[3].message.includes(`Duplicated definitions found for template: 'basicTemplate2'`), true);
    // });

    // it(`TestDuplicatedTemplatesInImportFiles`, function() {
    //     var diagnostics = GetDiagnostics(`DuplicatedTemplatesInImportFiles.lg`);

    //     assert.strictEqual(2, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(`Duplicated definitions found for template: 'basicTemplate'`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(`Duplicated definitions found for template: 'basicTemplate2'`), true);
    // });

    // it(`TestEmptyLGFile`, function() {
    //     var diagnostics = GetDiagnostics(`EmptyTemplate.lg`);

    //     assert.strictEqual(1, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.noTemplateBody('template')), true);
    // });

    // it(`TestErrorStructuredTemplate`, function() {
    //     var diagnostics = GetDiagnostics(`ErrorStructuredTemplate.lg`);

    //     assert.strictEqual(5, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.invalidStrucBody), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(LGErrors.emptyStrucContent), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
    //     assert.strictEqual(diagnostics[2].message.includes(`Error occurred when parsing expression 'NOTemplate()'. NOTemplate does not have an evaluator`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[3].severity);
    //     assert.strictEqual(diagnostics[3].message.includes(`Error occurred when parsing expression 'NOTemplate()'. NOTemplate does not have an evaluator`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
    //     assert.strictEqual(diagnostics[4].message.includes(LGErrors.invalidStrucName), true);
    // });

    // it(`TestErrorTemplateName`, function() {
    //     var diagnostics = GetDiagnostics(`ErrorTemplateName.lg`);

    //     assert.strictEqual(5, diagnostics.length);
    //     for(const diagnostic of diagnostics)
    //     {
    //         assert.strictEqual(DiagnosticSeverity.Error, diagnostic.severity);
    //         assert.strictEqual(diagnostic.message.includes(LGErrors.invalidTemplateName), true);
    //     }
    // });

    // it(`TestInvalidLGFileImportPath`, function() {
    //     var diagnostics = GetDiagnostics(`InvalidLGFileImportPath.lg`);

    //     assert.strictEqual(1, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(`Could not find file`), true);
    // });

    // it(`TestLgTemplateFunctionError`, function() {
    //     var diagnostics = GetDiagnostics(`LgTemplateFunctionError.lg`);

    //     assert.strictEqual(2, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(`Error occurred when parsing expression 'NotExistTemplate()'. NotExistTemplate does not have an evaluator`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(`Error occurred when parsing expression 'template5('hello', 'world')'. arguments mismatch for template 'template5'. Expecting '1' arguments, actual '2'`), true);
    // });

    // it(`TestMultiLineVariation`, function() {
    //     var diagnostics = GetDiagnostics(`MultiLineVariation.lg`);

    //     assert.strictEqual(1, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.noEndingInMultiline), true);
    // });

    // it(`TestNoNormalTemplateBody`, function() {
    //     var diagnostics = GetDiagnostics(`NoNormalTemplateBody.lg`);

    //     assert.strictEqual(3, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.notEndWithElseInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(LGErrors.missingTemplateBodyInCondition), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
    //     assert.strictEqual(diagnostics[2].message.includes(LGErrors.missingTemplateBodyInCondition), true);
    // });

    // it(`TestNoTemplateRef`, function() {
    //     var diagnostics = GetDiagnostics(`NoTemplateRef.lg`);

    //     assert.strictEqual(3, diagnostics.length);

    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(`Error occurred when parsing expression 'templateRef()'. templateRef does not have an evaluator`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(`Error occurred when parsing expression 'templateRef(a)'. templateRef does not have an evaluator`), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
    //     assert.strictEqual(diagnostics[2].message.includes(`Error occurred when parsing expression 'templateRefInMultiLine()'. templateRefInMultiLine does not have an evaluator`), true);
    // });

    // it(`TestSwitchCaseFormatError`, function() {
    //     var diagnostics = GetDiagnostics(`SwitchCaseFormatError.lg`);

    //     assert.strictEqual(14, diagnostics.length);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
    //     assert.strictEqual(diagnostics[0].message.includes(LGErrors.invalidWhitespaceInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
    //     assert.strictEqual(diagnostics[1].message.includes(LGErrors.multipleSwithStatementInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
    //     assert.strictEqual(diagnostics[2].message.includes(LGErrors.notStartWithSwitchInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[3].severity);
    //     assert.strictEqual(diagnostics[3].message.includes(LGErrors.missingCaseInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
    //     assert.strictEqual(diagnostics[4].message.includes(LGErrors.invalidStatementInMiddlerOfSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[5].severity);
    //     assert.strictEqual(diagnostics[5].message.includes(LGErrors.notEndWithDefaultInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
    //     assert.strictEqual(diagnostics[6].message.includes(LGErrors.extraExpressionInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
    //     assert.strictEqual(diagnostics[7].message.includes(LGErrors.missingTemplateBodyInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[8].severity);
    //     assert.strictEqual(diagnostics[8].message.includes((LGErrors.extraExpressionInSwitchCase)), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[9].severity);
    //     assert.strictEqual(diagnostics[9].message.includes(LGErrors.missingTemplateBodyInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[10].severity);
    //     assert.strictEqual(diagnostics[10].message.includes(LGErrors.invalidExpressionInSwiathCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Error, diagnostics[11].severity);
    //     assert.strictEqual(diagnostics[11].message.includes(LGErrors.extraExpressionInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[12].severity);
    //     assert.strictEqual(diagnostics[12].message.includes(LGErrors.missingCaseInSwitchCase), true);
    //     assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[13].severity);
    //     assert.strictEqual(diagnostics[13].message.includes(LGErrors.notEndWithDefaultInSwitchCase), true);
    // });

    // it(`TestLoopDetected`, function() {
    //     var lgFile = GetLGFile(`LoopDetected.lg`);
    //     var errorMessage = '';
    //     var isSuccessful = false;
    //     try {
    //         lgFile.evaluateTemplate(`wPhrase`);
    //         isSuccessful = true;
    //     } catch(e) {
    //         errorMessage = e.toString();
    //     }

    //     assert.strictEqual(isSuccessful, false);
    //     assert.strictEqual(errorMessage.includes(LGErrors.loopDetected), true);
        

    //     try {
    //         lgFile.analyzeTemplate(`wPhrase`);
    //         isSuccessful = true;
    //     } catch(e) {
    //         errorMessage = e.toString();
    //     }

    //     assert.strictEqual(isSuccessful, false);
    //     assert.strictEqual(errorMessage.includes(LGErrors.loopDetected), true);
    // });

    // it(`AddTextWithWrongId`, function() {
    //     var diagnostics = LGParser.parseText(`[import](xx.lg) \r\n # t \n - hi`, `a.lg`).diagnostics;
    //     assert.strictEqual(1, diagnostics.length);
    //     //assert.strictEqual(diagnostics[0].message.includes(`Could not find file`), true);
    // });

    // it(`TestErrorExpression`, function() {
    //     var lgFile = GetLGFile(`ErrorExpression.lg`);
    //     var errorMessage = '';
    //     var isSuccessful = false;
    //     try {
    //         lgFile.evaluateTemplate(`template1`);
    //         isSuccessful = true;
    //     } catch(e) {
    //         errorMessage = e.toString();
    //     }

    //     assert.strictEqual(isSuccessful, false);
    //     assert.strictEqual(errorMessage.includes(`Error occurred when evaluating`), true);
    // });

    it('TestRunTimeErrors', function() {
        var lgFile = GetLGFile('RunTimeErrors.lg');

        // var errorMessage = '';
        // var isSuccessful = false;
        // try {
        //     lgFile.evaluateTemplate(`template1`);
        //     isSuccessful = true;
        // } catch(e) {
        //     errorMessage = e.toString();
        // }
        // assert.strictEqual(isSuccessful, false);
        // assert.strictEqual(errorMessage, `Error: 'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. `);

        // var errorMessage = '';
        // var isSuccessful = false;
        // try {
        //     lgFile.evaluateTemplate(`prebuilt1`);
        //     isSuccessful = true;
        // } catch(e) {
        //     errorMessage = e.toString();
        // }
        // assert.strictEqual(isSuccessful, false);
        // assert.strictEqual(errorMessage, `Error: 'dialog.abc' evaluated to null.[prebuilt1]  Error occurred when evaluating '-I want \${foreach(dialog.abc, item, template1())}'. `);

        // var errorMessage = '';
        // var isSuccessful = false;
        // try {
        //     lgFile.evaluateTemplate(`template2`);
        //     isSuccessful = true;
        // } catch(e) {
        //     errorMessage = e.toString();
        // }
        // assert.strictEqual(isSuccessful, false);
        // assert.strictEqual(errorMessage, `Error: 'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [template2]  Error occurred when evaluating '-With composition \${template1()}'. `);

        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate('conditionalTemplate1', { dialog : true });
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        assert.equal(errorMessage, `Error: 'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [conditionalTemplate1] Condition '\${dialog}':  Error occurred when evaluating '-I want \${template1()}'.`);

        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`conditionalTemplate2`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        assert.strictEqual(errorMessage, `'dialog.abc' evaluated to null. [conditionalTemplate2] Condition '\${dialog.abc}': Error occurred when evaluating '-IF :\${dialog.abc}'. `);

        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`structured1`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        //assert.strictEqual(errorMessage, `'dialog.abc' evaluated to null. [structured1] Property 'Text': Error occurred when evaluating 'Text=I want \${dialog.abc}'. `);

        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`structured2`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        //assert.strictEqual(errorMessage, `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [structured2] Property 'Text': Error occurred when evaluating 'Text=I want \${template1()}'. `);
        
        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`structured3`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        //assert.strictEqual(errorMessage, `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [structured2] Property 'Text': Error occurred when evaluating 'Text=I want \${template1()}'. [structured3]  Error occurred when evaluating '\${structured2()}'. `);

        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`switchcase1`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        //assert.strictEqual(errorMessage, `'dialog.abc' evaluated to null. [switchcase1] Case '\${1}': Error occurred when evaluating '-I want \${dialog.abc}'. `);

        var errorMessage = '';
        var isSuccessful = false;
        try {
            lgFile.evaluateTemplate(`switchcase2`);
            isSuccessful = true;
        } catch(e) {
            errorMessage = e.toString();
        }
        assert.strictEqual(isSuccessful, false);
        //assert.strictEqual(errorMessage, `'dialog.abc' evaluated to null. [switchcase2] Case 'Default': Error occurred when evaluating '-I want \${dialog.abc}'. `);
    });

    // it(`TestExpressionFormatError`, function() {
    //     var diagnostics = GetDiagnostics(`ExpressionFormatError.lg`);

    //     assert.strictEqual(1, diagnostics.length);
    //     assert.strictEqual(diagnostics[0].message.includes('Close } is missing in Expression'), true);
    // });

});