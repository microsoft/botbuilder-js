const assert = require('assert');
const path = require('path');
const {exec} = require('child_process');
const luis = path.resolve('../bin/luis');

describe('The LUIS cli --help -h argument', () => {

    it('should print the help contents when --help is used', done => {
        exec(`node ${luis} --help`, (error, stdout) => {
            assert(stdout.includes('Where <api group> is one of the following:'));
            assert(stdout.includes('Where <action> is one of the following:'));
            assert(stdout.includes('Arguments:'));
            assert(stdout.includes('Global Arguments:'));
            done();
        });
    });

    it('should print help contents for an <api group>', done => {
        exec(`node ${luis} apps --help`, (error, stdout) => {
            assert(stdout.includes('Where <action> is one of the following:'));
            assert(stdout.includes('Where <target> may be one of the following:'));
            done();
        });
    });

    it('should print help contents for a <target>', done => {
        exec(`node ${luis} apps customprebuiltdomains -h`, (error, stdout) => {
            assert(stdout.includes('Where <action> is one of the following:'));
            done();
        });
    });

    it('should print help contents for a <subtarget>', done => {
        exec(`node ${luis} models compositeentities -h`, (error, stdout) => {
            assert(stdout.includes('Where <action> is one of the following:'));
            assert(stdout.includes('Where <subtarget> may be one of the following:'));
            done();
        });
    });

    it('should provide suggestions when the action does not exist', done => {
        exec(`node ${luis} apps customprebuiltdomains -h`, (error, stdout) => {
            assert(stdout.includes('Where <action> is one of the following:'));
            done();
        });
    });

    it('should provide suggestions when the target does not exist', done => {
        exec(`node ${luis} models compositeentitie -h`, (error, stdout) => {
            assert(stdout.includes('compositeentitie does not exist. Did you mean one of these?'));
            done();
        });
    });

    it('should provide a list of arguments when --help is used on an action', done => {
        exec(`node ${luis} models compositeentities list -h`, (error, stdout) => {
            assert(stdout.includes('Where --<args> is one or more of the following:'));
            done();
        });
    });
});