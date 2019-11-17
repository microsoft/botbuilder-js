const { AdaptiveTest, AdaptiveDialog, OnDialogEvent, SendActivity, ExpectMessage, EndDialog } =  require('../');
const assert = require('assert');

describe('AdaptiveTest', function () {
    this.timeout(5000);

    it('should run a simple test.', async function () {
        // Create a simple bot
        const botDialog = new AdaptiveDialog('botMain');
        botDialog.addRule(new OnDialogEvent('beginDialog', [
            new SendActivity('Hello World')
        ]));

        // Define test
        const userDialog = new AdaptiveDialog('userMain');
        userDialog.addRule(new OnDialogEvent('beginTest', [
            new SendActivity('hi'),
            new ExpectMessage('Hello World'),
            new EndDialog()
        ]));

        // Create and run test
        await AdaptiveTest.create(userDialog, botDialog).runTest('beginTest');
    });
});