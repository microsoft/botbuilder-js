const { FileResource } = require('../lib');
const assert = require('assert');
const path = require('path');

describe('FileResource', function() {
    this.timeout(5000);

    it('FileResource load existing file relative path', async () => {
        const fileResource = new FileResource(`${ __dirname }/resources/foo.dialog`);
        assert.equal(fileResource.id, 'foo.dialog');
        const text = fileResource.readText();
        assert.equal(text[0], '{');
    });

    it('FileResource load existing file absolute path', async () => {
        const absolutePath = path.resolve(`${ __dirname }/resources/foo.dialog`);
        const fileResource = new FileResource(absolutePath);
        assert.equal(fileResource.id, 'foo.dialog');
        const text = fileResource.readText();
        assert.equal(text[0], '{');
    });
});
