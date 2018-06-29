/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var chai = require('chai');
var assert = chai.assert;
const parseFileContents = require('../lib/parseFileContents');
const testcases = require('./testcases/testcases-data');

describe('LUIS patterns concepts in .lu files', function() {
    it('should be parsed correctly when 1 intent 1 list entity is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["1-intent-pattern-list"].lufile,false,'en-us').LUISBlob, 
            testcases.tests["1-intent-pattern-list"].luisJSON);
    });
    it('should be parsed correctly when 1 intent 1 pattern.any entity is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["1-intent-pattern-patternAny"].lufile,false,'en-us').LUISBlob, 
            testcases.tests["1-intent-pattern-patternAny"].luisJSON);
    });

    it('should be parsed correctly when 3 intents as patterns is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["3-intents-patterns"].lufile,false,'en-us').LUISBlob, 
            testcases.tests["3-intents-patterns"].luisJSON);
    });
    
});