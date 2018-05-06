/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var chai = require('chai');
var assert = chai.assert;
var path = require('path');
const {exec} = require('child_process');
const ludown = path.resolve('../bin/ludown');

describe('The ludown cli tool', function() {

    it('should print the help contents when --help is passed as an argument', function() {
        exec(`node ${ludown} --help`, (error, stdout, stderr) => {
            assert(stdout.includes('-V') && stdout.includes('parse|p'));
            done();
        });
    });

    it('should show help when root file is missing', function() {
        exec(`node ${ludown} parse toluis`, (error, stdout, stderr) => {
            assert(stdout.includes('Usage: ludown parse ToLuis --in <luFile>'));
            done();
        });
    });

    it('should show ERROR when no parser decorations are found in a line', function() {
        exec(`node ${ludown} parse toluis --in ./test/testcases/bad2.lu`, (error, stdout, stderr) => {
            assert(stdout.includes('not part of a Intent/ Entity/ QnA'));
            done();
        });
    });

    
});