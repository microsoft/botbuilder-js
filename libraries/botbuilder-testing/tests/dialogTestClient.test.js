/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { DialogTestClient, DialogTestLogger } = require('../');
const { ComponentDialog, TextPrompt, WaterfallDialog, DialogTurnStatus, DialogSet } = require('botbuilder-dialogs');
const { ok: assert, strictEqual } = require('assert');


describe('DialogTestClient', function() {

    it('should create a DialogTestClient', async function() {
        let client = new DialogTestClient('test', null);
        assert(client instanceof DialogTestClient, 'Created an invalid object');
    });

    it('should create a DialogTestClient with a custom channelId', async function() {
        let client = new DialogTestClient('custom', null);
        assert(client._testAdapter.template.channelId == 'custom', 'Created with wrong channel id');
    });

    it('should set a dialogContext after an activity is received', async function() {
        let dialog = new WaterfallDialog('waterfall', [
            async step => {
                await step.context.sendActivity('hello');
                return step.endDialog();
            }
        ]);

        let client = new DialogTestClient('test', dialog);
        strictEqual(client.dialogContext, null);
        let reply = await client.sendActivity('hello');
        assert(client.dialogContext, 'client.dialogContext not found');
        assert(reply.text == 'hello', 'dialog responded with incorrect message');
        assert(reply.channelId == 'test', 'test channel id didnt get set');
        assert(client.dialogTurnResult.status == DialogTurnStatus.complete, 'dialog did not end properly');
    });

    it('should process a single turn waterfall dialog', async function() {

        let dialog = new WaterfallDialog('waterfall', [
            async(step) => {
                await step.context.sendActivity('hello');
                return step.endDialog();
            }
        ]);

        let client = new DialogTestClient('test', dialog);
        let reply = await client.sendActivity('hello');
        assert(reply.text == 'hello', 'dialog responded with incorrect message');
        assert(reply.channelId == 'test', 'test channel id didnt get set');
        assert(client.dialogTurnResult.status == DialogTurnStatus.complete, 'dialog did not end properly');
    });

    it('should process a 2 turn waterfall dialog', async function() {

        let dialog = new WaterfallDialog('waterfall', [
            async(step) => {
                await step.context.sendActivity('hello');
                await step.context.sendActivity({type: 'typing'});
                return step.next();
            },
            async(step) => {
                await step.context.sendActivity('hello 2');
                return step.endDialog();
            },
        ]);

        let client = new DialogTestClient('test', dialog, null, [new DialogTestLogger()], null, null);
        let reply = await client.sendActivity('hello');
        assert(reply.text == 'hello', 'dialog responded with incorrect message');
        // get typing
        reply = client.getNextReply();
        assert(reply.type == 'typing', 'dialog responded with incorrect message');
        reply = client.getNextReply();
        assert(reply.text == 'hello 2', 'dialog responded with incorrect 2nd message');
        assert(client.dialogTurnResult.status == DialogTurnStatus.complete, 'dialog did not end properly');
    });

    it('should process a component dialog', async function() {

        class MainDialog extends ComponentDialog {
            constructor(id) {
                super(id);

                let dialog = new WaterfallDialog('waterfall', [
                    async(step) => {
                        return step.prompt('textPrompt', 'Tell me something');
                    },
                    async(step) => {
                        await step.context.sendActivity('you said: ' + step.result);
                        return step.next();
                    },
                ]);

                this.addDialog(dialog);
                this.addDialog(new TextPrompt('textPrompt'));
            }

            async run(turnContext, accessor) {
                const dialogSet = new DialogSet(accessor);
                dialogSet.add(this);

                const dialogContext = await dialogSet.createContext(turnContext);
                const results = await dialogContext.continueDialog();
                if (results.status === DialogTurnStatus.empty) {
                    await dialogContext.beginDialog(this.id);
                }
            }
        }

        let component = new MainDialog('component');
        let client = new DialogTestClient('test', component, null, [new DialogTestLogger()]);
        let reply = await client.sendActivity('hello');
        assert(reply.text == 'Tell me something','dialog responded with incorrect message');
        reply = await client.sendActivity('foo');
        assert(reply.text == 'you said: foo', 'dialog responded with incorrect 2nd message');
        assert(client.dialogTurnResult.status == DialogTurnStatus.complete, 'dialog did not end properly');
    });
});