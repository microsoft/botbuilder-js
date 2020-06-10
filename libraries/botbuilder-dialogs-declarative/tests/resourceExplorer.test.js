const { ResourceExplorer, FolderResourceProvider } = require('../lib');
const assert = require('assert');
const { writeFileSync, existsSync, unlinkSync } = require('fs');
const { extname, join } = require('path');

function assertResourceType(explorer, resourceType) {
    const resources = explorer.getResources(resourceType);
    assert(resources.length);
    assert.equal(extname(resources[0].id), `.${ resourceType }`);
}

function assertResourceFound(explorer, id) {
    const resource = explorer.getResource(id);
    assert(resource, `getResource(${ id }) should return resource`);
    const dialogs = explorer.getResources('dialog');
    assert(dialogs.some(dialog => dialog.id == id), `getResources('dialog') should return resources`);
}

function assertResourceNotFound(explorer, id) {
    const resource = explorer.getResource(id);
    assert.equal(resource, undefined, `getResource(${ id }) should not return resouce`);
    const dialogs = explorer.getResources('dialog');
    assert(dialogs.every(dialog => dialog.id != id), `getResouces('dialog') should not return resouces`);
}

function assertResourceContents(explorer, id, contents) {
    const resource = explorer.getResource(id);
    let text = resource.readText();
    assert.equal(text, contents, `getResource(${ id }) contents not the same`);
    const dialogs = explorer.getResources('dialog').filter(dialog => dialog.id == id);
    assert(dialogs.length == 1, `getResouces('dialog') should return resouces`);
    const dialog = dialogs[0];
    text = dialog.readText();
    assert.equal(text, contents, `getResouces('dialog') contents not the same`);
}

describe('ResourecExplorer', function() {
    this.timeout(5000);

    it('add folders recursively', async () => {
        const explorer = new ResourceExplorer();
        explorer.addFolder(join(__dirname, 'resources'), true, false);
        assertResourceType(explorer, 'lu');
        assertResourceType(explorer, 'dialog');
        assertResourceFound(explorer, 'test.dialog');
        assertResourceFound(explorer, 'foo.dialog');
        assertResourceNotFound(explorer, 'bar.dialog');
    });

    it('add root folder only', async () => {
        const explorer = new ResourceExplorer();
        explorer.addFolder(join(__dirname, 'resources'), false, false);
        assertResourceFound(explorer, 'foo.dialog');
        assertResourceNotFound(explorer, 'test.dialog');
        let resources = explorer.getResources('lu');
        assert.equal(resources.length, 0, 'should not list lu resources in subfolders');
        resources = explorer.getResources('dialog');
        assert(resources.length, 'should list dialog resources in root folder');
    });

    it('watch file changes', async () => {
        const testPath = join(__dirname, 'resources/TestFolder/foobar.dialog');

        // clean the test file
        if (existsSync(testPath)) {
            unlinkSync(testPath);
        }

        const explorer = new ResourceExplorer();
        explorer.addFolder(join(__dirname, 'resources'), true, true);
        assertResourceNotFound(explorer, 'foobar.dialog');

        // write test file
        writeFileSync(testPath, '{"test": 123}');

        // wait 100ms for file changes
        await new Promise(resolve => setTimeout(resolve, 100));
        assertResourceFound(explorer, 'foobar.dialog');
        assertResourceContents(explorer, 'foobar.dialog', '{"test": 123}');


        // modify the contents
        writeFileSync(testPath, '{"test": 1234}');

        // wait 100ms for file changes
        await new Promise(resolve => setTimeout(resolve, 100));
        assertResourceFound(explorer, 'foobar.dialog');
        assertResourceContents(explorer, 'foobar.dialog', '{"test": 1234}');

        // remove test file
        unlinkSync(testPath);
    
        // wait 100ms for file changes
        await new Promise(resolve => setTimeout(resolve, 100));
        assertResourceNotFound(explorer, 'foorbar.dialog');
    });
});
