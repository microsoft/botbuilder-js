const { AdaptiveDialogComponentRegistration } = require('../../botbuilder-dialogs-adaptive/lib');
const { ResourceExplorer, FolderResourceProvider, ResourceChangeEvent } = require('../lib');
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
    assert.equal(resource, undefined, `getResource(${ id }) should not return resource`);
    const dialogs = explorer.getResources('dialog');
    assert(dialogs.every(dialog => dialog.id != id), `getResouces('dialog') should not return resources`);
}

function assertResourceContents(explorer, id, contents) {
    const resource = explorer.getResource(id);
    let text = resource.readText();
    assert.equal(text, contents, `getResource(${ id }) contents not the same`);
    const dialogs = explorer.getResources('dialog').filter(dialog => dialog.id == id);
    assert(dialogs.length == 1, `getResouces('dialog') should return resources`);
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

    it('add filtered folders', async () => {
        const explorer = new ResourceExplorer([]);
        explorer.addFolders(join(__dirname, 'resources'), ['TestFolder'], false);
        assertResourceFound(explorer, 'foo.dialog');
        assertResourceNotFound(explorer, 'test.dialog');
        assertResourceFound(explorer, 'test2.dialog');
        let resources = explorer.getResources('lu');
        assert.equal(resources.length, 0, 'should not list lu resources in filtered folders');
        resources = explorer.getResources('dialog');
        assert(resources.length, 'should list dialog resources in unfilterd folders');
    });

    it('add new resource type', async () => {
        const explorer = new ResourceExplorer([]);
        explorer.addFolders(join(__dirname, 'resources'), [], false);
        let resources = explorer.getResources('txt');
        assert.equal(resources.length, 0, 'should not list txt resources');
        explorer.addResourceType('txt');
        resources = explorer.getResources('txt');
        assert(resources.length > 0, 'should list txt resources');
    });

    it('avoid adding duplicated resource folders', async () => {
        const explorer = new ResourceExplorer([]);
        assert.throws(() => {
            explorer.addFolder(join(__dirname, 'resources'), true, false);
            explorer.addFolder(join(__dirname, 'resources'), true, false);
        }, 'should throw if adding duplicated resource folders');
    });

    it('dialog id assignment', async () => {
        const explorer = new ResourceExplorer();
        explorer.addFolders(join(__dirname, 'resources'), [], false);
        explorer.addComponent(new AdaptiveDialogComponentRegistration(explorer));

        const dialog = explorer.loadType('test.dialog');
        assert.equal(dialog.id, 'test.dialog', 'resource id should be used as default dialog id if none assigned.');

        const dialog2 = explorer.loadType('test2.dialog');
        assert.equal(dialog2.id, '1234567890', 'id in the .dialog file should be honored.');
    });

    it('event fired when new file added', async () => {
        const testPath = join(__dirname, 'resources/TestFolder/file_to_be_added.dialog');

        // clean the test file
        if (existsSync(testPath)) {
            unlinkSync(testPath);
        }

        const explorer = new ResourceExplorer();
        const resourceProvider = new FolderResourceProvider(explorer, join(__dirname, 'resources'), true, true);
        explorer.addResourceProvider(resourceProvider);

        let event, resource;
        explorer.changed = (e, resources) => {
            if (!event) { event = e; }
            if (!resource) { resource = resources[0]; }
        };

        // write test file
        writeFileSync(testPath, '{"test": 123}');
        await new Promise(resolve => setTimeout(resolve, 200));
        assert.equal(event, ResourceChangeEvent.added);
        assert.equal(resource.id, 'file_to_be_added.dialog');

        // clean up
        unlinkSync(testPath);
        resourceProvider.watcher.close();
    });

    it('event fired when file changed', async () => {
        const testPath = join(__dirname, 'resources/TestFolder/file_to_be_changed.dialog');

        // clean the test file
        if (existsSync(testPath)) {
            unlinkSync(testPath);
        }

        const explorer = new ResourceExplorer();
        const resourceProvider = new FolderResourceProvider(explorer, join(__dirname, 'resources'), true, true);
        explorer.addResourceProvider(resourceProvider);

        // write test file
        writeFileSync(testPath, '{"test": 123}');
        await new Promise(resolve => setTimeout(resolve, 100));

        let event, resource;
        explorer.changed = (e, resources) => {
            if (!event) { event = e; }
            if (!resource) { resource = resources[0]; }
        };

        // change test file
        writeFileSync(testPath, '{"test": 1234}');
        await new Promise(resolve => setTimeout(resolve, 200));
        assert.equal(event, ResourceChangeEvent.changed);
        assert.equal(resource.id, 'file_to_be_changed.dialog');

        // clean up
        unlinkSync(testPath);
        resourceProvider.watcher.close();
    });

    it('event fired when file removed', async () => {
        const testPath = join(__dirname, 'resources/TestFolder/file_to_be_removed.dialog');

        // clean the test file
        if (existsSync(testPath)) {
            unlinkSync(testPath);
        }

        const explorer = new ResourceExplorer();
        const resourceProvider = new FolderResourceProvider(explorer, join(__dirname, 'resources'), true, true);
        explorer.addResourceProvider(resourceProvider);

        // write test file
        writeFileSync(testPath, '{"test": 123}');
        await new Promise(resolve => setTimeout(resolve, 100));

        let event, resource;
        explorer.changed = (e, resources) => {
            if (!event) { event = e; }
            if (!resource) { resource = resources[0]; }
        };

        // remove test file
        unlinkSync(testPath);
        await new Promise(resolve => setTimeout(resolve, 200));
        assert.equal(event, ResourceChangeEvent.removed);
        assert.equal(resource.id, 'file_to_be_removed.dialog');

        // clean up
        resourceProvider.watcher.close();
    });

    it('watch file changes', async () => {
        const testPath = join(__dirname, 'resources/TestFolder/foobar.dialog');

        // clean the test file
        if (existsSync(testPath)) {
            unlinkSync(testPath);
        }

        const explorer = new ResourceExplorer();
        explorer.addFolders(join(__dirname, 'resources'));
        assertResourceNotFound(explorer, 'foobar.dialog');

        // write test file
        writeFileSync(testPath, '{"test": 123}');

        // wait 200ms for file changes
        await new Promise(resolve => setTimeout(resolve, 200));
        assertResourceFound(explorer, 'foobar.dialog');
        assertResourceContents(explorer, 'foobar.dialog', '{"test": 123}');


        // modify the contents
        writeFileSync(testPath, '{"test": 1234}');

        // wait 200ms for file changes
        await new Promise(resolve => setTimeout(resolve, 200));
        assertResourceFound(explorer, 'foobar.dialog');
        assertResourceContents(explorer, 'foobar.dialog', '{"test": 1234}');

        // remove test file
        unlinkSync(testPath);
    
        // wait 200ms for file changes
        await new Promise(resolve => setTimeout(resolve, 200));
        assertResourceNotFound(explorer, 'foobar.dialog');

        const resourceProvider = explorer.resourceProviders[0];
        resourceProvider.watcher.close();
    });
});
