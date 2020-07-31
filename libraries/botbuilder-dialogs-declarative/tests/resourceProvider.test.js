const { ResourceExplorer, FolderResourceProvider } = require('../lib');
const assert = require('assert');

describe('ResourceProvider', function () {
    this.timeout(5000);

    it('FolderResourceProvider load specific folder with dialog extension', async () => {
        const resourceExplorer = new ResourceExplorer();
        const resourceProvider = new FolderResourceProvider(resourceExplorer, `${ __dirname }/resources`, true, false);
        const dialogResources = resourceProvider.getResources('dialog');
        assert(dialogResources.length);
    });

    it('FolderResourceProvider load specific folder with lg extension', async () => {
        const resourceExplorer = new ResourceExplorer();
        const resourceProvider = new FolderResourceProvider(resourceExplorer, `${ __dirname }/resources`, true, false);
        const lgResources = resourceProvider.getResources('lg');
        assert(lgResources.length);
    });

});
