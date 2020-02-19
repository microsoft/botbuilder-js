const { LGParser, DiagnosticSeverity } = require('../');
const assert = require('assert');
const fs = require('fs');

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

describe('LGExceptionTest', function() {
    it('TestConditionFormatError', function() {
        var diagnostics = GetDiagnostics('ConditionFormatError.lg');
        assert.strictEqual(diagnostics.length, 10);
        assert.strictEqual(diagnostics[0].severity, DiagnosticSeverity.Warning);
    });
});