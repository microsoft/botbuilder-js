/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var chai = require('chai');
var assert = chai.assert;
const parseFileContents = require('../lib/parseFileContents');
const testcases = require('./testcases/testcases-data');

describe('LUIS intent and utterances concepts in .lu files', function() {
    it('should be parsed correctly when 1 intent and 1 entity is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["1-intent-1-entity"].lufile,false).LUISBlob, 
            testcases.tests["1-intent-1-entity"].luisJSON);
    });
    it('should be parsed correctly when 1 intent and labelled utterances is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["1-intent-labelled-utterances"].lufile,false).LUISBlob, 
            testcases.tests["1-intent-labelled-utterances"].luisJSON);
    });
    it('should be parsed correctly when 1 intent and prebuilt entity is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["1-intent-prebuilt-entity"].lufile,false).LUISBlob, 
            testcases.tests["1-intent-prebuilt-entity"].luisJSON);
    });
    it('should be parsed correctly when 1 intent is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["1-intent"].lufile,false).LUISBlob, 
            testcases.tests["1-intent"].luisJSON);
    });
    it('should be parsed correctly when 2 intents and scattered list entity definition is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["2-intent-scattered-list"].lufile,false).LUISBlob, 
            testcases.tests["2-intent-scattered-list"].luisJSON);
    });
    it('should be parsed correctly when 2 intents is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["2-intent"].lufile,false).LUISBlob, 
            testcases.tests["2-intent"].luisJSON);
    });
    
});