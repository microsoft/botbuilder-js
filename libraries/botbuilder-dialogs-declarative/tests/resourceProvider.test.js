const { Configurable, TextPrompt, Dialog, DialogManager } = require('botbuilder-dialogs');
const { MemoryStorage, TestAdapter } = require('botbuilder-core');
const { FileResource, FileResourceProvider } = require('../lib');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('FileResourceProvider', function () {
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
});
