const { Templates, DiagnosticSeverity, TemplateErrors } = require(`../`);
const assert = require(`assert`);

function GetExceptionExampleFilePath(fileName) {
    return `${ __dirname }/testData/exceptionExamples/` + fileName;
}

function GetLGFile(fileName) {
    var filePath = GetExceptionExampleFilePath(fileName);
    return Templates.parseFile(filePath);
}

function GetDiagnostics(fileName) {
    var filePath = GetExceptionExampleFilePath(fileName);
    return Templates.parseFile(filePath).diagnostics;
}

describe(`LGExceptionTest`, function() {
    it(`TestConditionFormatError`, function() {
        var diagnostics = GetDiagnostics(`ConditionFormatError.lg`);
        assert.strictEqual(diagnostics.length, 10);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.notEndWithElseInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(TemplateErrors.invalidExpressionInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(TemplateErrors.multipleIfInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[3].severity);
        assert.strictEqual(diagnostics[3].message.includes(TemplateErrors.notEndWithElseInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
        assert.strictEqual(diagnostics[4].message.includes(TemplateErrors.extraExpressionInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[5].severity);
        assert.strictEqual(diagnostics[5].message.includes(TemplateErrors.multipleIfInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
        assert.strictEqual(diagnostics[6].message.includes(TemplateErrors.invalidMiddleInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
        assert.strictEqual(diagnostics[7].message.includes(TemplateErrors.invalidWhitespaceInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[8].severity);
        assert.strictEqual(diagnostics[8].message.includes(TemplateErrors.invalidWhitespaceInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[9].severity);
        assert.strictEqual(diagnostics[9].message.includes(TemplateErrors.notStartWithIfInCondition), true);
    });

    it(`TestDuplicatedTemplates`, function() {
        var diagnostics = GetDiagnostics(`DuplicatedTemplates.lg`);

        assert.strictEqual(2, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')), true);

        var templates = GetLGFile(`DuplicatedTemplates.lg`);
        var allDiagnostics = templates.allDiagnostics;

        assert.strictEqual(4, allDiagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[0].severity);
        assert.strictEqual(allDiagnostics[0].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')), true);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[1].severity);
        assert.strictEqual(allDiagnostics[1].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')), true);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[2].severity);
        assert.strictEqual(allDiagnostics[2].message.includes(`Duplicated definitions found for template: 'basicTemplate'`), true);
        assert.strictEqual(DiagnosticSeverity.Error, allDiagnostics[3].severity);
        assert.strictEqual(allDiagnostics[3].message.includes(`Duplicated definitions found for template: 'basicTemplate2'`), true);
    });

    it(`TestDuplicatedTemplatesInImportFiles`, function() {
        var diagnostics = GetDiagnostics(`DuplicatedTemplatesInImportFiles.lg`);

        assert.strictEqual(2, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`Duplicated definitions found for template: 'basicTemplate'`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`Duplicated definitions found for template: 'basicTemplate2'`), true);
    });

    it(`TestEmptyLGFile`, function() {
        var diagnostics = GetDiagnostics(`EmptyTemplate.lg`);

        assert.strictEqual(1, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.noTemplateBody('template')), true);
    });

    it(`TestErrorStructuredTemplate`, function() {
        var diagnostics = GetDiagnostics(`ErrorStructuredTemplate.lg`);

        assert.strictEqual(8, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.invalidStrucBody), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(TemplateErrors.emptyStrucContent), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(`Error occurred when parsing expression 'NOTemplate()'. NOTemplate does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[3].severity);
        assert.strictEqual(diagnostics[3].message.includes(`Error occurred when parsing expression 'NOTemplate()'. NOTemplate does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
        assert.strictEqual(diagnostics[4].message.includes(TemplateErrors.invalidStrucName), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[5].severity);
        assert.strictEqual(diagnostics[5].message.includes(TemplateErrors.invalidStrucName), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
        assert.strictEqual(diagnostics[6].message.includes(TemplateErrors.missingStrucEnd), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
        assert.strictEqual(diagnostics[7].message.includes(TemplateErrors.invalidStrucBody), true);
    });

    it(`TestErrorTemplateName`, function() {
        var diagnostics = GetDiagnostics(`ErrorTemplateName.lg`);

        assert.strictEqual(5, diagnostics.length);
        for(const diagnostic of diagnostics)
        {
            assert.strictEqual(DiagnosticSeverity.Error, diagnostic.severity);
            assert.strictEqual(diagnostic.message.includes(TemplateErrors.invalidTemplateName), true);
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
        assert.strictEqual(diagnostics[0].message.includes(`Error occurred when parsing expression 'NotExistTemplate()'. NotExistTemplate does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`Error occurred when parsing expression 'template5('hello', 'world')'. arguments mismatch for template 'template5'. Expecting '1' arguments, actual '2'`), true);
    });

    it(`TestMultiLineVariation`, function() {
        var diagnostics = GetDiagnostics(`MultiLineVariation.lg`);

        assert.strictEqual(1, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.noEndingInMultiline), true);
    });

    it(`TestNoNormalTemplateBody`, function() {
        var diagnostics = GetDiagnostics(`NoNormalTemplateBody.lg`);

        assert.strictEqual(3, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.notEndWithElseInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(TemplateErrors.missingTemplateBodyInCondition), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(TemplateErrors.missingTemplateBodyInCondition), true);
    });

    it(`TestNoTemplateRef`, function() {
        var diagnostics = GetDiagnostics(`NoTemplateRef.lg`);

        assert.strictEqual(3, diagnostics.length);

        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(`Error occurred when parsing expression 'templateRef()'. templateRef does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(`Error occurred when parsing expression 'templateRef(a)'. templateRef does not have an evaluator`), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(`Error occurred when parsing expression 'templateRefInMultiLine()'. templateRefInMultiLine does not have an evaluator`), true);
    });

    it(`TestSwitchCaseFormatError`, function() {
        var diagnostics = GetDiagnostics(`SwitchCaseFormatError.lg`);

        assert.strictEqual(14, diagnostics.length);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[0].severity);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.invalidWhitespaceInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert.strictEqual(diagnostics[1].message.includes(TemplateErrors.multipleSwithStatementInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[2].severity);
        assert.strictEqual(diagnostics[2].message.includes(TemplateErrors.notStartWithSwitchInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[3].severity);
        assert.strictEqual(diagnostics[3].message.includes(TemplateErrors.missingCaseInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[4].severity);
        assert.strictEqual(diagnostics[4].message.includes(TemplateErrors.invalidStatementInMiddlerOfSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[5].severity);
        assert.strictEqual(diagnostics[5].message.includes(TemplateErrors.notEndWithDefaultInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[6].severity);
        assert.strictEqual(diagnostics[6].message.includes(TemplateErrors.extraExpressionInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[7].severity);
        assert.strictEqual(diagnostics[7].message.includes(TemplateErrors.missingTemplateBodyInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[8].severity);
        assert.strictEqual(diagnostics[8].message.includes((TemplateErrors.extraExpressionInSwitchCase)), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[9].severity);
        assert.strictEqual(diagnostics[9].message.includes(TemplateErrors.missingTemplateBodyInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[10].severity);
        assert.strictEqual(diagnostics[10].message.includes(TemplateErrors.invalidExpressionInSwiathCase), true);
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[11].severity);
        assert.strictEqual(diagnostics[11].message.includes(TemplateErrors.extraExpressionInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[12].severity);
        assert.strictEqual(diagnostics[12].message.includes(TemplateErrors.missingCaseInSwitchCase), true);
        assert.strictEqual(DiagnosticSeverity.Warning, diagnostics[13].severity);
        assert.strictEqual(diagnostics[13].message.includes(TemplateErrors.notEndWithDefaultInSwitchCase), true);
    });

    it(`TestLoopDetected`, function() {
        var templates = GetLGFile(`LoopDetected.lg`);
        
        assert.throws(() => templates.evaluate(`wPhrase`), Error(`Loop detected: welcome-user => wPhrase [wPhrase]  Error occurred when evaluating '-\${wPhrase()}'. [welcome-user]  Error occurred when evaluating '-\${welcome-user()}'.`));
        
        assert.throws(() => templates.analyzeTemplate(`wPhrase`), Error('Loop detected: welcome-user => wPhrase'),);
    });

    it(`AddTextWithWrongId`, function() {
        var diagnostics = Templates.parseText(`[import](xx.lg) \r\n # t \n - hi`, `a.lg`).diagnostics;
        assert.strictEqual(1, diagnostics.length);
        assert.strictEqual(diagnostics[0].message.includes(`Could not find file`), true);
    });

    it(`TestErrorExpression`, function() {
        var templates = GetLGFile(`ErrorExpression.lg`);
        assert.throws(() => templates.evaluate(`template1`), Error(`first(createArray(1, 2)) is neither a string nor a null object. [template1]  Error occurred when evaluating '-\${length(first(createArray(1,2)))}'.`));
    });

    it('TestRunTimeErrors', function() {
        var templates = GetLGFile('RunTimeErrors.lg');

        assert.throws(() => templates.evaluate(`template1`), Error(`'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'.`));

        assert.throws(() => templates.evaluate(`prebuilt1`), Error(`'dialog.abc' evaluated to null. [prebuilt1]  Error occurred when evaluating '-I want \${foreach(dialog.abc, item, template1())}'.`));

        assert.throws(() => templates.evaluate(`template2`), Error(`'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [template2]  Error occurred when evaluating '-With composition \${template1()}'.`));

        assert.throws(() => templates.evaluate('conditionalTemplate1', { dialog : true }), Error(`'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [conditionalTemplate1] Condition '\${dialog}':  Error occurred when evaluating '-I want \${template1()}'.`));

        assert.throws(() => templates.evaluate(`conditionalTemplate2`), Error(`'dialog.abc' evaluated to null. [conditionalTemplate2] Condition '\${dialog.abc}': Error occurred when evaluating '-IF :\${dialog.abc}'.`));

        assert.throws(() => templates.evaluate(`structured1`), Error(`'dialog.abc' evaluated to null. [structured1] Property 'Text': Error occurred when evaluating 'Text=I want \${dialog.abc}'.`));

        assert.throws(() => templates.evaluate(`structured2`), Error(`'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [structured2] Property 'Text': Error occurred when evaluating 'Text=I want \${template1()}'.`));
        
        assert.throws(() => templates.evaluate(`structured3`), Error(`'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [structured2] Property 'Text': Error occurred when evaluating 'Text=I want \${template1()}'. [structured3]  Error occurred when evaluating '\${structured2()}'.`));
        
        assert.throws(() => templates.evaluate(`switchcase1`, { turn : { testValue : 1 } }), Error(`'dialog.abc' evaluated to null. [switchcase1] Case '\${1}': Error occurred when evaluating '-I want \${dialog.abc}'.`));
        
        assert.throws(() => templates.evaluate(`switchcase2`, { turn : { testValue : 0 } }), Error(`'dialog.abc' evaluated to null. [switchcase2] Case 'Default': Error occurred when evaluating '-I want \${dialog.abc}'.`));
    });
});

it(`TestExpressionFormatError`, function() {
    var diagnostics = GetDiagnostics(`ExpressionFormatError.lg`);
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].message.includes(`Close } is missing in Expression`), true);
});

it(`TestMultiLineExpressionInLG`, function() {
    var diagnostics = GetDiagnostics(`MultiLineExprError.lg`);
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].message.includes(`Close } is missing in Expression`), true);

    diagnostics = Templates.parseText('#Demo2\r\n- ${createArray(1,\r\n, 2,3)').diagnostics;
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].message.includes(`Close } is missing in Expression`), true);

    diagnostics = Templates.parseText('#Demo4\r\n- ${createArray(1,\r\n2,3)\r\n> this is a comment').diagnostics;
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].message.includes(`Close } is missing in Expression`), true);

    diagnostics = Templates.parseText('#Demo4\r\n- ${createArray(1,\r\n2,3)\r\n#AnotherTemplate').diagnostics;
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0].message.includes(`Close } is missing in Expression`), true);
});