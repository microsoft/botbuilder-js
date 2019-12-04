const { Configurable, TextPrompt, Dialog, DialogManager } = require('botbuilder-dialogs');
const { AdaptiveDialog } = require('botbuilder-dialogs-adaptive');
const { MemoryStorage, TestAdapter } = require('botbuilder-core');
const { FileResource, FileResourceProvider, FolderResourceProvider } = require('../lib');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('ResourceProvider', function () {
    this.timeout(5000);

    it('FileResourceProvider load multi-level directory, get by id', async () => {
        let resourceProvider = new FileResourceProvider();
        resourceProvider.registerDirectory(`${__dirname}/resources`);

        let simplePromptResource = await resourceProvider.getResource('SimplePrompt.main.dialog');
        assert.equal(simplePromptResource.id(), 'SimplePrompt.main.dialog');
        const text = await simplePromptResource.readText();

        assert.equal(text[0], '{');
    });

    it('FileResourceProvider load single-level directory, get by id', async () => {
        let resourceProvider = new FileResourceProvider();
        resourceProvider.registerDirectory(`${__dirname}/resources/07 - BeginDialog`);
        let simplePromptResource = await resourceProvider.getResource('BeginDialog.main.dialog');

        assert.equal(simplePromptResource.id(), 'BeginDialog.main.dialog');
        const text = await simplePromptResource.readText();

        assert.equal(text[0], '{');
    });

    it('FileResourceProvider load multi-level directory, get by type', async () => {
        let resourceProvider = new FileResourceProvider();
        resourceProvider.registerDirectory(`${__dirname}/resources`);

        let dialogResources = await resourceProvider.getResources('dialog');

        assert.equal(dialogResources.length, 23);
    });

    it('FolderResourceProvider load specific folder with dialog extension', async() => {
        let resourceProvider = new FolderResourceProvider(`${__dirname}/resources/07 - BeginDialog`, true, false);

        let dialogResources = await resourceProvider.getResources('dialog');

        assert.equal(dialogResources.length, 3);
    });

    it('FolderResourceProvider load specific folder with lg extension', async() => {
        let resourceProvider = new FolderResourceProvider(`${__dirname}/resources/08 - ExternalLanguage`, true, false);

        let lgResources = await resourceProvider.getResources('lg');

        assert.equal(lgResources.length, 1);
    });
});
