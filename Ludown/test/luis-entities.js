/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var chai = require('chai');
var assert = chai.assert;
const parseFileContents = require('../lib/parseFileContents');
const testcases = require('./testcases/testcases-data');
const {exec} = require('child_process');
var path = require('path');
const ludown = path.resolve('../bin/ludown');

describe('LUIS entity types in .lu files', function() {
    it('should be parsed correctly when all entity types is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests["all-entity-types"].lufile,false).LUISBlob, 
            testcases.tests["all-entity-types"].luisJSON);
    });
    
    it('should be parsed correctly when phraselists is specified', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests.phraselist.lufile,false).LUISBlob, 
            testcases.tests.phraselist.luisJSON);
    });

    it('should show WARN message when no utterances are found for an intent', function() {
        exec(`node ${ludown} ./test/testcases/bad3.lu`, (error, stdout, stderr) => {
            assert(stdout.includes('[WARN] No utterances found for intent'));
            done();
        });
    });

    it('should show WARN message when no labelled value is found for an entity', function() {
        exec(`node ${ludown} ./test/testcases/bad3.lu`, (error, stdout, stderr) => {
            assert(stdout.includes('is missing labelled value'));
            done();
        });
    });
});