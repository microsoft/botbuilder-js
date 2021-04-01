const { Templates, DiagnosticSeverity, TemplateErrors, LGResource } = require('../');
const assert = require('assert');

function GetExceptionExampleFilePath(fileName) {
    return `${__dirname}/testData/exceptionExamples/` + fileName;
}

function GetLGFile(fileName) {
    var filePath = GetExceptionExampleFilePath(fileName);
    return Templates.parseFile(filePath);
}

function GetDiagnostics(fileName) {
    var filePath = GetExceptionExampleFilePath(fileName);
    return Templates.parseFile(filePath).diagnostics;
}

describe(`LGExceptionTest`, function () {
    /**
     * Disk I/O is slow and variable, causing issues in pipeline tests, so we
     * preload all of the file reads here so that it doesn't count against individual test duration.
     */
    const preloaded = {
        ConditionFormatError: GetDiagnostics(`ConditionFormatError.lg`),
        DuplicatedTemplates: GetDiagnostics(`DuplicatedTemplates.lg`),
        DuplicatedTemplatesLg: GetLGFile(`DuplicatedTemplates.lg`),
        DuplicatedTemplatesInImportFiles: GetDiagnostics(`DuplicatedTemplatesInImportFiles.lg`),
        EmptyTemplate: GetDiagnostics(`EmptyTemplate.lg`),
        EmptyLGFile: GetDiagnostics(`EmptyLGFile.lg`),
        ErrorStructuredTemplate: GetDiagnostics(`ErrorStructuredTemplate.lg`),
        ErrorTemplateName: GetDiagnostics(`ErrorTemplateName.lg`),
        InvalidLGFileImportPath: GetDiagnostics(`InvalidLGFileImportPath.lg`),
        InvalidImportFormat: GetDiagnostics(`InvalidImportFormat.lg`),
        LgTemplateFunctionError: GetDiagnostics(`LgTemplateFunctionError.lg`),
        MultiLineVariation: GetDiagnostics(`MultiLineVariation.lg`),
        MultiLineTemplate: GetDiagnostics(`MultiLineTemplate.lg`),
        NoNormalTemplateBody: GetDiagnostics(`NoNormalTemplateBody.lg`),
        NoTemplateRef: GetDiagnostics(`NoTemplateRef.lg`),
        SwitchCaseFormatError: GetDiagnostics(`SwitchCaseFormatError.lg`),
        LoopDetected: GetLGFile(`LoopDetected.lg`),
        ErrorExpression: GetLGFile(`ErrorExpression.lg`),
        RunTimeErrors: GetLGFile('RunTimeErrors.lg'),
        ExpressionFormatError: GetDiagnostics(`ExpressionFormatError.lg`),
        MultiLineExprError: GetDiagnostics(`MultiLineExprError.lg`),
        ErrorLine: GetDiagnostics(`ErrorLine.lg`),
        CycleRef1: GetDiagnostics(`CycleRef1.lg`),
    };

    it(`TestConditionFormatError`, function () {
        const diagnostics = preloaded.ConditionFormatError;
        assert.strictEqual(diagnostics.length, 10);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[0].message.includes(TemplateErrors.notEndWithElseInCondition));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(TemplateErrors.invalidExpressionInCondition));
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(diagnostics[2].message.includes(TemplateErrors.multipleIfInCondition));
        assert.strictEqual(diagnostics[3].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[3].message.includes(TemplateErrors.notEndWithElseInCondition));
        assert.strictEqual(diagnostics[4].severity, DiagnosticSeverity.Error);
        assert(diagnostics[4].message.includes(TemplateErrors.extraExpressionInCondition));
        assert.strictEqual(diagnostics[5].severity, DiagnosticSeverity.Error);
        assert(diagnostics[5].message.includes(TemplateErrors.multipleIfInCondition));
        assert.strictEqual(diagnostics[6].severity, DiagnosticSeverity.Error);
        assert(diagnostics[6].message.includes(TemplateErrors.invalidMiddleInCondition));
        assert.strictEqual(diagnostics[7].severity, DiagnosticSeverity.Error);
        assert(diagnostics[7].message.includes(TemplateErrors.invalidWhitespaceInCondition));
        assert.strictEqual(diagnostics[8].severity, DiagnosticSeverity.Error);
        assert(diagnostics[8].message.includes(TemplateErrors.invalidWhitespaceInCondition));
        assert.strictEqual(diagnostics[9].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[9].message.includes(TemplateErrors.notStartWithIfInCondition));
    });

    it(`TestDuplicatedTemplates`, function () {
        const diagnostics = preloaded.DuplicatedTemplates;

        assert.strictEqual(diagnostics.length, 2);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')));
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[1].severity);
        assert(diagnostics[1].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')));

        const templates = preloaded.DuplicatedTemplatesLg;
        const allDiagnostics = templates.allDiagnostics;

        assert.strictEqual(allDiagnostics.length, 4);
        assert.strictEqual(allDiagnostics[0].severity, DiagnosticSeverity.Error);
        assert(allDiagnostics[0].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')));
        assert.strictEqual(allDiagnostics[1].severity, DiagnosticSeverity.Error);
        assert(allDiagnostics[1].message.includes(TemplateErrors.duplicatedTemplateInSameTemplate('template1')));
        assert.strictEqual(allDiagnostics[2].severity, DiagnosticSeverity.Error);
        assert(allDiagnostics[2].message.includes(`Duplicated definitions found for template: 'basicTemplate'`));
        assert.strictEqual(allDiagnostics[3].severity, DiagnosticSeverity.Error);
        assert(allDiagnostics[3].message.includes(`Duplicated definitions found for template: 'basicTemplate2'`));
    });

    it(`TestDuplicatedTemplatesInImportFiles`, function () {
        const diagnostics = preloaded.DuplicatedTemplatesInImportFiles;

        assert.strictEqual(diagnostics.length, 2);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(`Duplicated definitions found for template: 'basicTemplate'`));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(`Duplicated definitions found for template: 'basicTemplate2'`));
    });

    it(`TestEmptyTemplate`, function () {
        const diagnostics = preloaded.EmptyTemplate;

        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[0].message.includes(TemplateErrors.noTemplateBody('template')));
    });

    it(`TestEmptyLGFile`, function () {
        const diagnostics = preloaded.EmptyLGFile;

        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[0].message.includes(TemplateErrors.noTemplate));
    });

    it(`TestErrorStructuredTemplate`, function () {
        const diagnostics = preloaded.ErrorStructuredTemplate;

        assert.strictEqual(diagnostics.length, 8);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(TemplateErrors.invalidStrucBody('abc')));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(TemplateErrors.emptyStrucContent));
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(
            diagnostics[2].message.includes(
                `Error occurred when parsing expression 'NOTemplate()'. NOTemplate does not have an evaluator`
            )
        );
        assert.strictEqual(DiagnosticSeverity.Error, diagnostics[3].severity);
        assert(
            diagnostics[3].message.includes(
                `Error occurred when parsing expression 'NOTemplate()'. NOTemplate does not have an evaluator`
            )
        );
        assert.strictEqual(diagnostics[4].severity, DiagnosticSeverity.Error);
        assert(diagnostics[4].message.includes(TemplateErrors.invalidStrucName('Activity%')));
        assert.strictEqual(diagnostics[5].severity, DiagnosticSeverity.Error);
        assert(diagnostics[5].message.includes(TemplateErrors.invalidStrucName('Activity]')));
        assert.strictEqual(diagnostics[6].severity, DiagnosticSeverity.Error);
        assert(diagnostics[6].message.includes(TemplateErrors.missingStrucEnd));
        assert.strictEqual(diagnostics[7].severity, DiagnosticSeverity.Error);
        assert(diagnostics[7].message.includes(TemplateErrors.invalidStrucBody('- hi')));
    });

    it(`TestErrorTemplateName`, function () {
        const diagnostics = preloaded.ErrorTemplateName;

        assert.strictEqual(diagnostics.length, 7);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(TemplateErrors.invalidParameter('param1; param2')));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(TemplateErrors.invalidParameter('param1 param2')));
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(diagnostics[2].message.includes(TemplateErrors.invalidTemplateName('template3(errorparams')));
        assert.strictEqual(diagnostics[3].severity, DiagnosticSeverity.Error);
        assert(diagnostics[3].message.includes(TemplateErrors.invalidParameter('a)test(param1')));
        assert.strictEqual(diagnostics[4].severity, DiagnosticSeverity.Error);
        assert(diagnostics[4].message.includes(TemplateErrors.invalidParameter('$%^')));
        assert.strictEqual(diagnostics[5].severity, DiagnosticSeverity.Error);
        assert(diagnostics[5].message.includes(TemplateErrors.invalidTemplateName('the-name-of-template')));
        assert.strictEqual(diagnostics[6].severity, DiagnosticSeverity.Error);
        assert(diagnostics[6].message.includes(TemplateErrors.invalidTemplateName('t1.1')));
    });

    it(`TestInvalidLGFileImportPath`, function () {
        const diagnostics = preloaded.InvalidLGFileImportPath;

        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(`Could not find file`));
    });

    it(`TestInvalidImportFormat`, function () {
        const diagnostics = preloaded.InvalidImportFormat;

        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert.strictEqual(diagnostics[0].message, TemplateErrors.importFormatError);
    });

    it(`TestLgTemplateFunctionError`, function () {
        const diagnostics = preloaded.LgTemplateFunctionError;

        assert.strictEqual(diagnostics.length, 2);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(
            diagnostics[0].message.includes(
                `Error occurred when parsing expression 'NotExistTemplate()'. NotExistTemplate does not have an evaluator`
            )
        );
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(
            diagnostics[1].message.includes(
                `Error occurred when parsing expression 'template5('hello', 'world')'. arguments mismatch for template 'template5'. Expecting '1' arguments, actual '2'`
            )
        );
    });

    it(`TestMultiLineVariation`, function () {
        const diagnostics = preloaded.MultiLineVariation;

        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(TemplateErrors.noEndingInMultiline));
    });

    it(`TestMultiLineTemplate`, function () {
        const diagnostics = preloaded.MultiLineTemplate;

        assert.strictEqual(diagnostics.length, 1);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert.strictEqual(diagnostics[0].message.includes(TemplateErrors.noEndingInMultiline), true);
    });

    it(`TestNoNormalTemplateBody`, function () {
        const diagnostics = preloaded.NoNormalTemplateBody;

        assert.strictEqual(diagnostics.length, 3);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[0].message.includes(TemplateErrors.notEndWithElseInCondition));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(TemplateErrors.missingTemplateBodyInCondition));
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(diagnostics[2].message.includes(TemplateErrors.missingTemplateBodyInCondition));
    });

    it(`TestNoTemplateRef`, function () {
        const diagnostics = preloaded.NoTemplateRef;

        assert.strictEqual(diagnostics.length, 3);

        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(
            diagnostics[0].message.includes(
                `Error occurred when parsing expression 'templateRef()'. templateRef does not have an evaluator`
            )
        );
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(
            diagnostics[1].message.includes(
                `Error occurred when parsing expression 'templateRef(a)'. templateRef does not have an evaluator`
            )
        );
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(
            diagnostics[2].message.includes(
                `Error occurred when parsing expression 'templateRefInMultiLine()'. templateRefInMultiLine does not have an evaluator`
            )
        );
    });

    it(`TestSwitchCaseFormatError`, function () {
        const diagnostics = preloaded.SwitchCaseFormatError;

        assert.strictEqual(diagnostics.length, 14);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(TemplateErrors.invalidWhitespaceInSwitchCase));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(TemplateErrors.multipleSwithStatementInSwitchCase));
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(diagnostics[2].message.includes(TemplateErrors.notStartWithSwitchInSwitchCase));
        assert.strictEqual(diagnostics[3].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[3].message.includes(TemplateErrors.missingCaseInSwitchCase));
        assert.strictEqual(diagnostics[4].severity, DiagnosticSeverity.Error);
        assert(diagnostics[4].message.includes(TemplateErrors.invalidStatementInMiddlerOfSwitchCase));
        assert.strictEqual(diagnostics[5].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[5].message.includes(TemplateErrors.notEndWithDefaultInSwitchCase));
        assert.strictEqual(diagnostics[6].severity, DiagnosticSeverity.Error);
        assert(diagnostics[6].message.includes(TemplateErrors.extraExpressionInSwitchCase));
        assert.strictEqual(diagnostics[7].severity, DiagnosticSeverity.Error);
        assert(diagnostics[7].message.includes(TemplateErrors.missingTemplateBodyInSwitchCase));
        assert.strictEqual(diagnostics[8].severity, DiagnosticSeverity.Error);
        assert(diagnostics[8].message.includes(TemplateErrors.extraExpressionInSwitchCase));
        assert.strictEqual(diagnostics[9].severity, DiagnosticSeverity.Error);
        assert(diagnostics[9].message.includes(TemplateErrors.missingTemplateBodyInSwitchCase));
        assert.strictEqual(diagnostics[10].severity, DiagnosticSeverity.Error);
        assert(diagnostics[10].message.includes(TemplateErrors.invalidExpressionInSwiathCase));
        assert.strictEqual(diagnostics[11].severity, DiagnosticSeverity.Error);
        assert(diagnostics[11].message.includes(TemplateErrors.extraExpressionInSwitchCase));
        assert.strictEqual(diagnostics[12].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[12].message.includes(TemplateErrors.missingCaseInSwitchCase));
        assert.strictEqual(diagnostics[13].severity, DiagnosticSeverity.Warning);
        assert(diagnostics[13].message.includes(TemplateErrors.notEndWithDefaultInSwitchCase));
    });

    it(`TestLoopDetected`, function () {
        const templates = preloaded.LoopDetected;

        assert.throws(
            () => templates.evaluate(`wPhrase`),
            Error(
                `Loop detected: welcome_user => wPhrase [wPhrase]  Error occurred when evaluating '-\${wPhrase()}'. [welcome_user]  Error occurred when evaluating '-\${welcome_user()}'.`
            )
        );

        assert.throws(() => templates.analyzeTemplate(`wPhrase`), Error('Loop detected: welcome_user => wPhrase'));

        assert.throws(() => templates.analyzeTemplate(`shouldFail`), Error('Loop detected: shouldFail'));
    });

    it(`AddTextWithWrongId`, function () {
        const diagnostics = Templates.parseResource(new LGResource('a.lg', 'a.lg', `[import](xx.lg) \r\n # t \n - hi`))
            .diagnostics;
        assert.strictEqual(diagnostics.length, 1);
        assert(diagnostics[0].message.includes(`Could not find file`));
    });

    it(`TestErrorExpression`, function () {
        const templates = preloaded.ErrorExpression;
        assert.throws(
            () => templates.evaluate(`template1`),
            Error(
                `first(createArray(1, 2)) is neither a string nor a null object. [template1]  Error occurred when evaluating '-\${length(first(createArray(1,2)))}'.`
            )
        );
    });

    it('TestRunTimeErrors', function () {
        const templates = preloaded.RunTimeErrors;

        assert.throws(
            () => templates.evaluate(`template1`),
            Error(
                `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`prebuilt1`),
            Error(
                `'dialog.abc' evaluated to null. [prebuilt1]  Error occurred when evaluating '-I want \${foreach(dialog.abc, item, template1())}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`template2`),
            Error(
                `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [template2]  Error occurred when evaluating '-With composition \${template1()}'.`
            )
        );

        assert.throws(
            () => templates.evaluate('conditionalTemplate1', { dialog: true }),
            Error(
                `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [conditionalTemplate1] Condition '\${dialog}':  Error occurred when evaluating '-I want \${template1()}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`conditionalTemplate2`),
            Error(
                `'dialog.abc' evaluated to null. [conditionalTemplate2] Condition '\${dialog.abc}': Error occurred when evaluating '-IF :\${dialog.abc}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`structured1`),
            Error(
                `'dialog.abc' evaluated to null. [structured1] Property 'Text': Error occurred when evaluating 'Text=I want \${dialog.abc}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`structured2`),
            Error(
                `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [structured2] Property 'Text': Error occurred when evaluating 'Text=I want \${template1()}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`structured3`),
            Error(
                `'dialog.abc' evaluated to null. [template1]  Error occurred when evaluating '-I want \${dialog.abc}'. [structured2] Property 'Text': Error occurred when evaluating 'Text=I want \${template1()}'. [structured3]  Error occurred when evaluating '\${structured2()}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`switchcase1`, { turn: { testValue: 1 } }),
            Error(
                `'dialog.abc' evaluated to null. [switchcase1] Case '\${1}': Error occurred when evaluating '-I want \${dialog.abc}'.`
            )
        );

        assert.throws(
            () => templates.evaluate(`switchcase2`, { turn: { testValue: 0 } }),
            Error(
                `'dialog.abc' evaluated to null. [switchcase2] Case 'Default': Error occurred when evaluating '-I want \${dialog.abc}'.`
            )
        );
    });

    it(`TestExpressionFormatError`, function () {
        const diagnostics = preloaded.ExpressionFormatError;
        assert.strictEqual(diagnostics.length, 1);
        assert(diagnostics[0].message.includes(`Close } is missing in Expression`));
    });

    it(`TestMultiLineExpressionInLG`, function () {
        let diagnostics = preloaded.MultiLineExprError;
        assert.strictEqual(diagnostics.length, 1);
        assert(diagnostics[0].message.includes(`Close } is missing in Expression`));

        diagnostics = Templates.parseResource(new LGResource('', '', '#Demo2\r\n- ${createArray(1,\r\n, 2,3)'))
            .diagnostics;
        assert.strictEqual(diagnostics.length, 1);
        assert(diagnostics[0].message.includes(`Close } is missing in Expression`));

        diagnostics = Templates.parseResource(
            new LGResource('', '', '#Demo4\r\n- ${createArray(1,\r\n2,3)\r\n> this is a comment')
        ).diagnostics;
        assert.strictEqual(diagnostics.length, 1);
        assert(diagnostics[0].message.includes(`Close } is missing in Expression`));
    });

    it(`TestErrorLine`, function () {
        const diagnostics = preloaded.ErrorLine;
        assert.strictEqual(diagnostics.length, 4);

        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.includes(TemplateErrors.syntaxError("mismatched input '-' expecting <EOF>")));
        assert.strictEqual(diagnostics[1].severity, DiagnosticSeverity.Error);
        assert(diagnostics[1].message.includes(TemplateErrors.invalidStrucName(']')));
        assert.strictEqual(diagnostics[2].severity, DiagnosticSeverity.Error);
        assert(diagnostics[2].message.includes(TemplateErrors.missingStrucEnd));
        assert.strictEqual(diagnostics[3].severity, DiagnosticSeverity.Error);
        assert(diagnostics[3].message.includes(TemplateErrors.invalidStrucBody('- hi')));
    });

    it(`TestLoopReference`, function () {
        const diagnostics = preloaded.CycleRef1;
        assert.strictEqual(diagnostics.length, 1);

        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Error);
        assert(diagnostics[0].message.startsWith(TemplateErrors.loopDetected));
    });
});
