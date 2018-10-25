const fs = require('fs-extra');
const path = require('path');
const nock = require('nock');

const nockBack = require('nock').back;

const MockMode = Object.freeze({
    "wild": "wild",
    "dryrun": "dryrun",
    "record": "record",
    "lockdown": "lockdown"
});

function usingNock(test, mode, options = null) {
    const testDirectory = getMockDirectory(test);
    const testFile = getFormatedNockFileName(test)

    nockBack.setMode(mode);
    nockBack.fixtures = testDirectory;

    let fixedScope = null;

    if (options && options.scope) {
        fixedScope = options.scope;
    }

    const setFixedScope = function (requests) {
        if (fixedScope) {
            requests = requests.map(req => {
                req.scope = fixedScope;
                return req;
            });
        }

        return requests;
    }

    const nockBackOptions = {
        afterRecord: setFixedScope,
        recorder: {
            output_objects: true,
            dont_print: true,
            enable_reqheaders_recording: false,
            use_separator: false
        }
    };

    if (mode === MockMode.record) {
        fs.removeSync(path.join(testDirectory, testFile));
    }

    return nockBack(testFile, nockBackOptions);
}

function getMockDirectory(test) {
    if(test && test.title && test.parent) {
        return path.join(__dirname, 'TestData', test.parent.title);
    } else {
        throw new Error('No \'test\' object has been provided.');
    }
}

function getFormatedNockFileName(test) {
    return `${test.title.replace(/ /g, '_')}.json`
}

module.exports = {
    MockMode: MockMode,
    usingNock: usingNock
}