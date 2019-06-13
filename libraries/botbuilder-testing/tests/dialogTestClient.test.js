const { DialogTestClient } = require('../');
const { WaterfallDialog, DialogTurnStatus } = require('botbuilder-dialogs');
const assert = require('assert');


describe('DialogTestClient', function() {

    it('should create a DialogTestClient', async function() {
        let client = new DialogTestClient();
        assert(client instanceof DialogTestClient, 'Created an invalid object');
    });

    it('should process a single turn waterfall dialog', async function() {

        let dialog = new WaterfallDialog('waterfall', [
            async(step) => {
                await step.context.sendActivity('hello');
                return step.next();
            }
        ]);

        let client = new DialogTestClient(dialog);
        let reply = await client.sendActivity('hello');
        assert(reply.text == 'hello', 'dialog responded with incorrect message');
        assert(client.dialogTurnResult.status == DialogTurnStatus.empty, 'dialog did not end properly');

    });


    it('should process a 2 turn waterfall dialog', async function() {

        let dialog = new WaterfallDialog('waterfall', [
            async(step) => {
                await step.context.sendActivity('hello');
                return step.next();
            },
            async(step) => {
                await step.context.sendActivity('hello 2');
                return step.next();
            },
        ]);

        let client = new DialogTestClient(dialog);
        let reply = await client.sendActivity('hello');
        assert(reply.text == 'hello', 'dialog responded with incorrect message');
        reply = await client.getNextReply();
        assert(reply.text == 'hello 2', 'dialog responded with incorrect 2nd message');
        assert(client.dialogTurnResult.status == DialogTurnStatus.empty, 'dialog did not end properly');
    });

});