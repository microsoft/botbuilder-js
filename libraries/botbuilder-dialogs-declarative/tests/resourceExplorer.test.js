const { ResourceExplorer } = require('../lib');
const assert = require('assert');
const { writeFileSync, existsSync, unlinkSync } = require('fs')

describe('ResourecExplorer', function () {
    this.timeout(50000);
    var flag = false;

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    it('ResourecExplorer load specific folder with lg extension', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/08 - ExternalLanguage`, true, false);

        let lgResources = await explorer.getResources('lg');

        assert.equal(lgResources.length, 1);
    });

    it('ResourecExplorer load specific folder with dialog extension', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/07 - BeginDialog`, true, false);

        let dialogResources = await explorer.getResources('dialog');

        assert.equal(dialogResources.length, 3);
    });

    it('Test missing resource', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}`, true, false);

        let dialogResources = await explorer.getResource('test2.dialog');

        assert.equal(dialogResources, undefined);
    });

    it('Test folder source shallow', async () => {
        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources`, false, false);

        let dialogResources = await explorer.getResource('test.dialog');

        // shallow folder shouldn't list the dialog resources 
        assert.equal(dialogResources, undefined);
    });

    it('Test folder source new fires changed', async () => {
        const path = `${__dirname}/resources/TestFolder/removeFile.dialog`
        flag = false

        if (existsSync(path)) {
            unlinkSync(path);
        }

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/TestFolder`, true, true);
        explorer.emitter.on('changed', () => {
            flag = true
        })

        let dialogResources = await explorer.getResource('removeFile.dialog');
        assert.equal(dialogResources, undefined)


        if (!existsSync(path)) {
            writeFileSync(path, JSON.stringify({ 'test': 'test' }))
        }

        await delay(500)

        if (existsSync(path)) {
            unlinkSync(path);
        }

        await delay(500)

        assert.equal(flag, true);
    });

    it('Test folder source write fires changed', async () => {
        const path = `${__dirname}/resources/TestFolder/removeFile.dialog`
        flag = false

        if (existsSync(path)) {
            unlinkSync(path);
        }

        if (!existsSync(path)) {
            writeFileSync(path, JSON.stringify({ 'test': 'test' }))
        }

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/TestFolder`, true, true);
        explorer.emitter.on('changed', () => {
            flag = true
        })

        let dialogResources = await explorer.getResource('removeFile.dialog');
        assert.notEqual(dialogResources, undefined)

        if (existsSync(path)) {
            writeFileSync(path, JSON.stringify({ 'test': 'test2' }))
        }

        await delay(500)

        if (existsSync(path)) {
            unlinkSync(path);
        }

        await delay(500)

        assert.equal(flag, true);
    });

    it('Test folder source delete fires changed', async () => {
        const path = `${__dirname}/resources/TestFolder/removeFile.dialog`
        flag = false

        if (existsSync(path)) {
            unlinkSync(path);
        }

        if (!existsSync(path)) {
            writeFileSync(path, JSON.stringify({ 'test': 'test' }))
        }

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/TestFolder`, true, true);
        explorer.emitter.on('changed', () => {
            flag = true
        })

        let dialogResources = await explorer.getResource('removeFile.dialog');
        assert.notEqual(dialogResources, undefined)

        if (existsSync(path)) {
            unlinkSync(path);
        }

        await delay(1000)

        assert.equal(flag, true);
    });


});
