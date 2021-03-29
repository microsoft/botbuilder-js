const assert = require('assert');
const { AdaptiveBotComponent } = require('botbuilder-dialogs-adaptive');
const { DialogManager } = require('botbuilder-dialogs');
const { ResourceExplorer, FolderResourceProvider, ResourceChangeEvent } = require('../lib');
const { ServiceCollection, noOpConfiguration } = require('botbuilder-dialogs-adaptive-runtime-core');
const { TestAdapter, MemoryStorage, useBotState, UserState, ConversationState } = require('botbuilder-core');
const { extname, join } = require('path');
const { writeFileSync, existsSync, unlinkSync } = require('fs');

function assertResourceType(explorer, resourceType) {
    const resources = explorer.getResources(resourceType);
    assert(resources.length);
    assert.strictEqual(extname(resources[0].id), `.${resourceType}`);
}

function assertResourceFound(explorer, id) {
    const resource = explorer.getResource(id);
    assert(resource, `getResource(${id}) should return resource`);
    const dialogs = explorer.getResources('dialog');
    assert(
        dialogs.some((dialog) => dialog.id == id),
        `getResources('dialog') should return resources`
    );
}

function assertResourceNotFound(explorer, id) {
    const resource = explorer.getResource(id);
    assert.strictEqual(resource, undefined, `getResource(${id}) should not return resource`);
    const dialogs = explorer.getResources('dialog');
    assert(
        dialogs.every((dialog) => dialog.id != id),
        `getResouces('dialog') should not return resources`
    );
}

function assertResourceContents(explorer, id, contents) {
    const resource = explorer.getResource(id);
    let text = resource.readText();
    assert.strictEqual(text, contents, `getResource(${id}) contents not the same`);
    const dialogs = explorer.getResources('dialog').filter((dialog) => dialog.id == id);
    assert(dialogs.length == 1, `getResouces('dialog') should return resources`);
    const dialog = dialogs[0];
    text = dialog.readText();
    assert.strictEqual(text, contents, `getResouces('dialog') contents not the same`);
}

describe('ResourceExplorer', function () {
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
        assert.strictEqual(resources.length, 0, 'should not list lu resources in subfolders');
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
        assert.strictEqual(resources.length, 0, 'should not list lu resources in filtered folders');
        resources = explorer.getResources('dialog');
        assert(resources.length, 'should list dialog resources in unfilterd folders');
    });

    it('add new resource type', async () => {
        const explorer = new ResourceExplorer([]);
        explorer.addFolders(join(__dirname, 'resources'), [], false);
        let resources = explorer.getResources('txt');
        assert.strictEqual(resources.length, 0, 'should not list txt resources');
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
        const services = new ServiceCollection({
            declarativeTypes: [],
        });

        new AdaptiveBotComponent().configureServices(services, noOpConfiguration);

        const declarativeTypes = services.mustMakeInstance('declarativeTypes');
        const explorer = new ResourceExplorer({ declarativeTypes }).addFolders(join(__dirname, 'resources'), [], false);

        const dialog = explorer.loadType('test.dialog');
        assert.strictEqual(
            dialog.id,
            'test.dialog',
            'resource id should be used as default dialog id if none assigned.'
        );
        assert.strictEqual(dialog.triggers[0].actions[0].id, '1234567890');
        assert.strictEqual(dialog.triggers[0].actions[1].id, 'test3.dialog');

        const dialog2 = explorer.loadType('test2.dialog');
        assert.strictEqual(dialog2.id, '1234567890', 'id in the .dialog file should be honored.');
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
            if (!event) {
                event = e;
            }
            if (!resource) {
                resource = resources[0];
            }
        };

        // write test file
        writeFileSync(testPath, '{"test": 123}');
        await new Promise((resolve) => setTimeout(resolve, 200));
        assert.strictEqual(event, ResourceChangeEvent.added);
        assert.strictEqual(resource.id, 'file_to_be_added.dialog');

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
        await new Promise((resolve) => setTimeout(resolve, 100));

        let event, resource;
        explorer.changed = (e, resources) => {
            if (!event) {
                event = e;
            }
            if (!resource) {
                resource = resources[0];
            }
        };

        // change test file
        writeFileSync(testPath, '{"test": 1234}');
        await new Promise((resolve) => setTimeout(resolve, 200));
        assert.strictEqual(event, ResourceChangeEvent.changed);
        assert.strictEqual(resource.id, 'file_to_be_changed.dialog');

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
        await new Promise((resolve) => setTimeout(resolve, 100));

        let event, resource;
        explorer.changed = (e, resources) => {
            if (!event) {
                event = e;
            }
            if (!resource) {
                resource = resources[0];
            }
        };

        // remove test file
        unlinkSync(testPath);
        await new Promise((resolve) => setTimeout(resolve, 200));
        assert.strictEqual(event, ResourceChangeEvent.removed);
        assert.strictEqual(resource.id, 'file_to_be_removed.dialog');

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
        await new Promise((resolve) => setTimeout(resolve, 200));
        assertResourceFound(explorer, 'foobar.dialog');
        assertResourceContents(explorer, 'foobar.dialog', '{"test": 123}');

        // modify the contents
        writeFileSync(testPath, '{"test": 1234}');

        // wait 200ms for file changes
        await new Promise((resolve) => setTimeout(resolve, 200));
        assertResourceFound(explorer, 'foobar.dialog');
        assertResourceContents(explorer, 'foobar.dialog', '{"test": 1234}');

        // remove test file
        unlinkSync(testPath);

        // wait 200ms for file changes
        await new Promise((resolve) => setTimeout(resolve, 200));
        assertResourceNotFound(explorer, 'foobar.dialog');

        const resourceProvider = explorer.resourceProviders[0];
        resourceProvider.watcher.close();
    });

    it('cycle reference', async () => {
        const services = new ServiceCollection({
            declarativeTypes: [],
        });

        new AdaptiveBotComponent().configureServices(services, noOpConfiguration);

        const declarativeTypes = services.mustMakeInstance('declarativeTypes');
        const resourceExplorer = new ResourceExplorer({ declarativeTypes }).addFolder(
            join(__dirname, './resources/CycleDetection'),
            false,
            false
        );

        const root = resourceExplorer.loadType('root.dialog');
        const dm = new DialogManager(root);
        const adapter = new TestAdapter(async (context) => {
            await dm.onTurn(context);
        });
        const storage = new MemoryStorage();
        useBotState(adapter, new UserState(storage), new ConversationState(storage));
        await adapter
            .send('hi')
            .assertReply('Hello')
            .send('oh?')
            .assertReply('World')
            .send('hi')
            .assertReply('Hello')
            .startTest();
    });
});
