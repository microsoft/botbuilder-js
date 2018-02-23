const assert = require('assert');
const path = require('path');
const {exec} = require('child_process');
const chatdown = path.resolve('../bin/chatdown.js');
describe('The Chatdown tool', () => {
    it('should throw if the a config path was provided but the config file was not found', done => {
        exec(`node ${chatdown} --config=notThere`, (error, stdout, stderr) => {
            assert(stdout === 'ReferenceError: notThere cannot be found');
            done();
        });
    });

    it('should print the help contents when --help is passed as an argument', done => {
        exec(`node ${chatdown} --help`, (error, stdout, stderr) => {
            assert(stdout.includes('--in') && stdout.includes('--out'));
            done();
        });
    });

    it('should accept data as a pipe and output the results', done => {
        exec(`echo bot: hello! user:can I get some help? | node ${chatdown} --bot=bot --user=user`, (error, stdout, stderr) => {
            assert.doesNotThrow(() => JSON.parse(stdout));
            done();
        });
    });
});