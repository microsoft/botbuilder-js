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

describe('The LU modeller tool', function() {
    it('should parse QnA concepts .lu files correctly', function() {
        assert.deepEqual(
            parseFileContents.parseFile(testcases.tests.qna.lufile,false).QnABlob, 
            testcases.tests.qna.qnaJSON);
    });

    it('should show WARN message when an answer is missing for qna pair', function() {
        exec(`node ${ludown} ./test/testcases/bad.lu`, (error, stdout, stderr) => {
            assert(stdout.includes('[WARN] No answer found for question'));
            done();
        });
    });

    
});