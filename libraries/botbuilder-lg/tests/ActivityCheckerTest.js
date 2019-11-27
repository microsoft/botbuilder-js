/*
const { TemplateEngine, ActivityChecker } = require('../');
const assert = require('assert');

function getTemplateEngine(){
    const filePath =  `${ __dirname }/testData/Examples/DiagnosticStructuredLG.lg`;
    return new TemplateEngine().addFile(filePath);
}

function getDiagnostics(templateName, data){
    const engine = getTemplateEngine();
    const lgResult = engine.evaluateTemplate(templateName, data);
    return ActivityChecker.check(lgResult);
}

describe('ActivityCheckerTest', function() {
    it('inlineActivityChecker', function() {
        const diagnostics = ActivityChecker.check('Not a valid json');
        assert(diagnostics.length === 1);
        assert.strictEqual(diagnostics[0].severity, 1);
        assert.strictEqual(diagnostics[0].message, 'LG output is not a json object, and will fallback to string format.');
    });

    it('emptyActivityChecker', function() {
        const diagnostics = ActivityChecker.check('{}');
        assert(diagnostics.length === 1);
        assert.strictEqual(diagnostics[0].severity, 0);
        assert.strictEqual(diagnostics[0].message, `'lgType' does not exist in lg output json object.`);
    });

    it('ErrorStructuredType', function() {
        const diagnostics = getDiagnostics('ErrorStructuredType', undefined);
        assert(diagnostics.length === 1);
        assert.strictEqual(diagnostics[0].severity, 0);
        assert.strictEqual(diagnostics[0].message, `Type 'mystruct' is not supported currently.`);
    });

    it('ErrorActivityType', function() {
        const diagnostics = getDiagnostics('ErrorActivityType', undefined);
        assert(diagnostics.length === 2);
        assert.strictEqual(diagnostics[0].severity, 0);
        assert.strictEqual(diagnostics[0].message, `'xxx' is not a valid activity type.`);
        assert.strictEqual(diagnostics[1].severity, 1);
        assert.strictEqual(diagnostics[1].message, `'invalidproperty' not support in Activity.`);
    });

    it('ErrorMessage', function() {
        const diagnostics = getDiagnostics('ErrorMessage', undefined);
        assert(diagnostics.length === 5);
        assert.strictEqual(diagnostics[0].severity, 1);
        assert.strictEqual(diagnostics[0].message, `'attachment,suggestedaction' not support in Activity.`);
        assert.strictEqual(diagnostics[1].severity, 1);
        assert.strictEqual(diagnostics[1].message, `'mystruct' is not card action type.`);
        assert.strictEqual(diagnostics[2].severity, 0);
        assert.strictEqual(diagnostics[2].message, `'yyy' is not a valid card action type.`);
        assert.strictEqual(diagnostics[3].severity, 0);
        assert.strictEqual(diagnostics[3].message, `'notsure' is not a boolean value.`);
        assert.strictEqual(diagnostics[4].severity, 1);
        assert.strictEqual(diagnostics[4].message, `'mystruct' is not an attachment type.`);
    });
});

*/