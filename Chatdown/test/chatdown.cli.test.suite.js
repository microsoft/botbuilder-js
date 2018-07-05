const assert = require('assert');
const path = require('path');
const {exec} = require('child_process');
const chatdown = path.resolve('../bin/chatdown');

describe('The Chatdown cli tool', () => {

    it('should print the help contents when --help is passed as an argument', done => {
        exec(`node ${chatdown} --help`, (error, stdout, stderr) => {
            assert(stdout.includes('--help') && stdout.includes('--version'));
            done();
        });
    });

    it('should throw and output a message when user or bot is omitted from the input file', done => {
        exec(`echo bot: hello! user:can I get some help? | node ${chatdown} `, (error, stdout, stderr) => {
            assert(stderr.trim() === 'ReferenceError: Cannot reference "bot" or "user"');
            done();
        });
    });

    it('should accept data as a pipe and output the results', done => {
        exec(`(echo user=Joe && echo bot=LuliBot && echo LuliBot: hello! && echo joe:can I get some help?) | node ${chatdown} --bot bot --user user`, (error, stdout, stderr) => {
            assert.doesNotThrow(() => JSON.parse(stdout));
            done();
        });
    });

    it('should throw when a malformed config options is encountered in the input', done => {
        exec(`echo bot=LuliBot=joe | node ${chatdown} `, (error, stdout, stderr) => {
            assert(stderr.trim() === 'Error: Malformed configurations options detected. Options must be in the format optionName=optionValue');
            done();
        });
    });
});