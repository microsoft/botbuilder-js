const { Configurable, TextPrompt, Dialog, DialogManager } = require('botbuilder-dialogs');
const { AdaptiveDialog } = require('botbuilder-dialogs-adaptive');
const { MemoryStorage, TestAdapter } = require('botbuilder-core');
const { FileResource, FileResourceProvider, FolderResourceProvider, ResourceExplorer } = require('../lib');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('ResourecExplorer', function () {
    this.timeout(5000);

    it('ResourecExplorer load specific folder with lg extension', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/08 - ExternalLanguage`);

        let lgResources = await explorer.getResources('lg');

        assert.equal(lgResources.length, 1);
    });

    it('ResourecExplorer load specific folder with dialog extension', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${__dirname}/resources/07 - BeginDialog`);

        let dialogResources = await explorer.getResources('dialog');

        assert.equal(dialogResources.length, 3);
    });


});
