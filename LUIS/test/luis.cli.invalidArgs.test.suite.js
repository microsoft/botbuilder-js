const assert = require('assert');
const path = require('path');
const {exec} = require('child_process');
const luis = path.resolve('../bin/luis');

describe('When the arguments are invalid, the LUIS cli', () => {

    describe('should print the correct error and display the help contents', () => {

        it('when the service does not exist', done =>{
            exec(`node ${luis} apps nonexistant`, (error, stdout) => {
                assert(stdout.includes('ArgumentError: The service does not exist'));
                assert(stdout.includes('nonexistant does not exist. Did you mean one of these?'));
                done();
            });
        });

        it('when the action was not specified', done =>{
            exec(`node ${luis} models compositeentities `, (error, stdout) => {
                assert(stdout.includes('ArgumentError: The operation does not exist'));
                assert(stdout.includes('Valid <action> is one of the following:'));
                done();
            });
        });

        it('when the action is unknown', done =>{
            exec(`node ${luis} models compositeentities crreate`, (error, stdout) => {
                assert(stdout.includes('ArgumentError: The operation does not exist'));
                assert(stdout.includes('crreate does not exist, did you mean one of these?'));
                done();
            });
        });
    });
});
