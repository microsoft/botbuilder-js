const { FileResource } = require('../lib');
const assert = require('assert');
const path = require('path');

describe('FileResource', function() {
    this.timeout(5000);

    it('FileResource load existing file relative path', async () => {
        const fileResource = new FileResource(`${ __dirname }/resources/00 - TextPrompt/SimplePrompt.main.dialog`);
        assert.equal(fileResource.id(), 'SimplePrompt.main.dialog');
        const text = await fileResource.readText();
        assert.equal(text[0], '{');
    });

    it('FileResource load existing file absolute path', async () => {
        const absolutePath = path.resolve(`${ __dirname }/resources/00 - TextPrompt/SimplePrompt.main.dialog`);
        const fileResource = new FileResource(absolutePath);
        assert.equal(fileResource.id(), 'SimplePrompt.main.dialog');
        const text = await fileResource.readText();
        assert.equal(text[0], '{');
    });
});
