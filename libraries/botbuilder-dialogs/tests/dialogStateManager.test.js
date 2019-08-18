const { TestAdapter } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('../');
const assert = require('assert');

async function runTest(logic, activeDialog) {
    const state = { dialogStack:[] };
    if (activeDialog) {
        state.dialogStack.push({ id: 'testDialog', state: { foo: 'bar' } });
    }
    const adapter = new TestAdapter(async (context) => {
        const dc = new DialogContext( new DialogSet(), context, state);
        await logic(dc);
        await context.sendActivity('done');
    });

    await adapter.send('test')
                 .assertReply('done');
}

describe('DialogStateManager', function () {
    this.timeout(5000);

    it('DialogContext should create a state manager', async function () {
        await runTest(async (dc) => {
            assert(dc.state);
        }, false);
    });

    it('Should have a "dialog" scope', async function () {
        await runTest(async (dc) => {
            const scope = dc.state.getScope('dialog');
            assert(scope);
            assert(scope.foo == 'bar');
        }, true);
    });

    it('Should return undefined for "dialog" scope if no active dialog', async function () {
        await runTest(async (dc) => {
            const scope = dc.state.getScope('dialog');
            assert(scope == undefined);
        }, false);
    });

    it('Should support adding a custom scope', async function () {
        await runTest(async (dc) => {
            const testScope = { bar: 'foo' };
            dc.state.setScope('test', testScope);
            const scope = dc.state.getScope('test');
            assert(scope);
            assert(scope == testScope);
            assert(scope.bar == 'foo');
        }, false);
    });

    it('Should throw exception if overwriting "dialog" scope', async function () {
        await runTest(async (dc) => {
            try {
                dc.state.setScope('dialog', {});
                assert(false, 'no exception thrown');
            } catch (err) {
            }
        }, true);
    });

    it('Should get a value using default resolver', async function () {
        await runTest(async (dc) => {
            const foo = dc.state.getValue('dialog.foo');
            assert(foo == 'bar');
        }, true);
    });

    it('Should support setting a value using default resolver', async function () {
        await runTest(async (dc) => {
            dc.state.setValue('dialog.bar', 'foo');
            const bar = dc.state.getValue('dialog.bar');
            assert(bar == 'foo');
        }, true);
    });

    it('Should overwrite a value using default resolver', async function () {
        await runTest(async (dc) => {
            dc.state.setValue('dialog.bar', 'foo');
            const bar = dc.state.getValue('dialog.bar');
            assert(bar == 'foo');
            const 
        }, true);
    });
});
