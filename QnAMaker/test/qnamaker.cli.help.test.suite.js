const assert = require('assert');
const path = require('path');
const {exec} = require('child_process');
const qnamaker = path.resolve('../bin/qnamaker');

describe('The QnA Maker cli --help -h argument', () => {

    it('should print the help contents when --help is used', done => {
        exec(`node ${qnamaker} --help`, (error, stdout) => {
            assert(stdout.includes('Supported operation names:'));
            assert(stdout.includes('Configuration and Overrides:'));
            assert(stdout.includes('Global Arguments:'));
            done();
        });
    });
});
