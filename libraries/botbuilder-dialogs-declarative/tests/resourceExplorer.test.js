const { ResourceExplorer } = require('../lib');
const assert = require('assert');

describe('ResourecExplorer', function() {
    this.timeout(5000);

    it('ResourecExplorer load specific folder with lg extension', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${ __dirname }/resources/08 - ExternalLanguage`, true, false);

        let lgResources = await explorer.getResources('lg');

        assert.equal(lgResources.length, 1);
    });

    it('ResourecExplorer load specific folder with dialog extension', async () => {

        let explorer = new ResourceExplorer();
        explorer.addFolder(`${ __dirname }/resources/07 - BeginDialog`, true, false);

        let dialogResources = await explorer.getResources('dialog');

        assert.equal(dialogResources.length, 3);
    });


});
