const { 
    AdaptiveTest, AdaptiveDialog, OnDialogEvent, SendActivity, ExpectMessage, 
    EndDialog, SetProperty, TextInput
} =  require('../');
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

    it('should fail if an error occurs.', async function () {
        // Create a simple bot
        const botDialog = new AdaptiveDialog('botMain');
        botDialog.addRule(new OnDialogEvent('beginDialog', [
            new SendActivity('Hello World')
        ]));

        // Define test
        const userDialog = new AdaptiveDialog('userMain');
        userDialog.addRule(new OnDialogEvent('beginTest', [
            new SendActivity('hi'),
            new ExpectMessage('Hello'),
            new EndDialog()
        ]));

        // Create and run test
        let error = false;
        try {
            await AdaptiveTest.create(userDialog, botDialog).runTest('beginTest');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('should return a value from a test.', async function () {
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
            new SetProperty('$result.foo', '"bar"'),
            new EndDialog('$result')
        ]));

        // Create and run test
        const results = await AdaptiveTest.create(userDialog, botDialog).runTest('beginTest');
        assert(typeof results == 'object', `no turn result returned`);
        assert(results.status == 'complete', `unexpected status returned: ${results.status}`);
        assert(typeof results.result == 'object', `no value returned.`);
        assert(results.result.foo == 'bar', `unexpected value returned.`);
    });

    it('should run a multi turn test.', async function () {
        // Create a simple bot
        const botDialog = new AdaptiveDialog('botMain');
        botDialog.addRule(new OnDialogEvent('beginDialog', [
            new TextInput('$first', `What is your first name?`),
            new TextInput('$last', `What is your last name?`),
            new SendActivity(`Hello {$first} {$last}`)
        ]));

        // Define test
        const userDialog = new AdaptiveDialog('userMain');
        userDialog.addRule(new OnDialogEvent('beginTest', [
            new SendActivity('hi'),
            new ExpectMessage('What is your first name?'),
            new SendActivity('Bob'),
            new ExpectMessage('What is your last name?'),
            new SendActivity('Smith'),
            new ExpectMessage('Hello Bob Smith'),
            new EndDialog()
        ]));

        // Create and run test
        await AdaptiveTest.create(userDialog, botDialog).runTest('beginTest');
    });
});