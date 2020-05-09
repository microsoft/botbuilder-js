const { ConversationState, UserState, MemoryStorage, TurnContext, TestAdapter } = require('botbuilder-core');
const { ClassMemoryScope, ConversationMemoryScope, DialogMemoryScope,
    SettingsMemoryScope, ThisMemoryScope, TurnMemoryScope, UserMemoryScope,
    Dialog, DialogSet, DialogContext, DialogContainer } = require('../');
const assert = require('assert');

const beginMessage = {
    text: `begin`,
    type: 'message',
    channelId: 'test',
    from: { id: 'user' },
    recipient: { id: 'bot' },
    conversation: { id: 'convo1' }
};

class TestDialog extends Dialog {
    constructor(id, message) {
        super(id);
        this.message = message;
        this.expression = {
            tryGetValue: (state) => {
                return { value: 'resolved value' };
            }
        }
    }

    async beginDialog(dc, options) {
        dc.activeDialog.state.isDialog = true;
        await dc.context.sendActivity(this.message);
        return Dialog.EndOfTurn;
    }
}

class TestContainer extends DialogContainer {
    constructor(id, child) {
        super(id);
        if (child) {
            this.dialogs.add(child);
            this.childId = child.id;
        }
    }

    async beginDialog(dc, options) {
        const state = dc.activeDialog.state;
        state.isContainer = true;
        if (this.childId) {
            state.dialog = {};
            const childDc = this.createChildContext(dc);
            return await childDc.beginDialog(this.childId, options);
        } else {
            return Dialog.EndOfTurn;
        }
    }

    async continueDialog(dc) {
        const childDc = this.createChildContext(dc);
        if (childDc) {
            return await childDc.continueDialog();
        } else {
            return Dialog.EndOfTurn;
        }
    }

    createChildContext(dc) {
        const state = dc.activeDialog.state;
        if (state.dialog) {
            const childDc = new DialogContext(this.dialogs, dc.context, state.dialog);
            childDc.parent = dc;
            return childDc;
        }

        return undefined;
    }
}

describe('Memory - Memory Scopes', function() {
    this.timeout(5000);

    it('ClassMemoryScope should find registered dialog.', async function() {
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        await dialogState.set(context, {
            dialogStack: [
                { id: 'test', state: {} }
            ]
        });
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new ClassMemoryScope();
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `memory not returned`);
        assert(memory.message == 'test message');
        assert(memory.expression == 'resolved value');
    });

    it('ClassMemoryScope should not allow setMemory() call.', async function() {
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        await dialogState.set(context, {
            dialogStack: [
                { id: 'test', state: {} }
            ]
        });
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new ClassMemoryScope();
            scope.setMemory(dc, {});
        } catch (err) {
            error = true;
        }
        assert(error == true);
    });

    it('ClassMemoryScope should ignore load() and saveChanges() calls.', async function() {
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        await dialogState.set(context, {
            dialogStack: [
                { id: 'test', state: {} }
            ]
        });
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new ClassMemoryScope();
        await scope.load(dc);
        const memory = scope.getMemory(dc);
        memory.message = 'foo';
        await scope.saveChanges(dc);
        assert(dialog.message == 'test message');
    });

    it('ClassMemoryScope should not allow delete() call.', async function() {
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        await dialogState.set(context, {
            dialogStack: [
                { id: 'test', state: {} }
            ]
        });
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new ClassMemoryScope();
            await scope.delete(dc);
        } catch (err) {
            error = true;
        }
        assert(error == true);
    });


    it('ConversationMemoryScope should return conversation state.', async function() {
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        context.turnState.set('ConversationState', convoState);
        const dc = await dialogs.createContext(context);

        // Initialize conversation state
        await convoState.createProperty('conversation').set(context, { foo: 'bar' });
        await convoState.saveChanges(context);

        // Run test
        const scope = new ConversationMemoryScope();
        const memory = scope.getMemory(dc);
        assert.equal(typeof memory, 'object', `state not returned`);
        assert.equal(memory.conversation.foo, 'bar');
    });

    it('UserMemoryScope should not return state if not loaded.', async function() {
        // Initialize user state
        const storage = new MemoryStorage();
        let context = new TurnContext(new TestAdapter(), beginMessage);
        let userState = new UserState(storage);
        context.turnState.set('UserState', userState);
        await userState.createProperty('user').set(context, { foo: 'bar' });
        await userState.saveChanges(context);

        // Replace context and convoState with new instances
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);
        context.turnState.set('UserState', userState);

        // Create a DialogState property, DialogSet and register the dialogs.
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new UserMemoryScope(userState);
        const memory = scope.getMemory(dc);
        assert.equal(memory, undefined, `state returned`);
    });

    it('UserMemoryScope should return state once loaded.', async function() {
        // Initialize user state
        const storage = new MemoryStorage();
        let context = new TurnContext(new TestAdapter(), beginMessage);
        let userState = new UserState(storage);
        context.turnState.set('UserState', userState);
        await userState.createProperty('user').set(context, { foo: 'bar' });
        await userState.saveChanges(context);

        // Replace context and convoState with new instances
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);
        context.turnState.set('UserState', userState);

        // Create a DialogState property, DialogSet and register the dialogs.
        const convoState = new ConversationState(storage);
        context.turnState.set('ConversationState', convoState);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new UserMemoryScope();
        let memory = scope.getMemory(dc);
        assert.equal(memory, undefined, `state returned`);
        
        await scope.load(dc);
        memory = scope.getMemory(dc);
        assert.equal(typeof memory, 'object', `state not returned`);
        assert.equal(memory.user.foo, 'bar');
    });

    it('DialogMemoryScope should return containers state.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('container');
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.isContainer == true);
    });

    it('DialogMemoryScope should return parent containers state for children.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container', new TestDialog('child', 'test message'));
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('container');
        const childDc = dc.child;
        assert(childDc != undefined, `No child DC`);
        const memory = scope.getMemory(childDc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.isContainer == true);
    });

    it('DialogMemoryScope should return childs state when no parent.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('test');
        const memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        assert(memory.isDialog == true);
    });

    it('DialogMemoryScope should overwrite parents memory.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container', new TestDialog('child', 'test message'));
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('container');
        const childDc = dc.child;
        assert(childDc != undefined, `No child DC`);
        scope.setMemory(childDc, { foo: 'bar' });
        const memory = scope.getMemory(childDc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('DialogMemoryScope should overwrite active dialogs memory.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('container');
        scope.setMemory(dc, { foo: 'bar' });
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('DialogMemoryScope should raise error if setMemory() called without memory.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new DialogMemoryScope();
            await dc.beginDialog('container');
            scope.setMemory(dc, undefined);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('DialogMemoryScope should raise error if delete() called.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new DialogMemoryScope();
            await scope.delete(dc);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('SettingsMemoryScope should return content of settings.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState).add(new TestDialog('test', 'test message'));

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);
        const settings = require('./test.settings.json');
        dc.context.turnState.set('settings', settings);

        // Run test
        const scope = new SettingsMemoryScope();
        const memory = scope.getMemory(dc);
        assert.equal(typeof memory, 'object', `settings not returned`);
        assert.equal(memory.string, 'test');
        assert.equal(memory.int, 3);
        assert.equal(memory.array[0], 'zero');
        assert.equal(memory.array[1], 'one');
        assert.equal(memory.array[2], 'two');
        assert.equal(memory.array[3], 'three');
        assert.equal(dc.state.getValue('settings.fakeArray.0'), 'zero');
        assert.equal(dc.state.getValue('settings.fakeArray.1'), 'one');
        assert.equal(dc.state.getValue('settings.fakeArray.2'), 'two');
        assert.equal(dc.state.getValue('settings.fakeArray.3'), 'three');
        assert.equal(dc.state.getValue('settings.fakeArray.zzz'), 'cat');
        for (const key in process.env) {
            if (typeof process.env[key] == 'string') {
                assert(memory[key] == process.env[key]);
            }
        }
    });

    it('ThisMemoryScope should return active dialogs state.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new ThisMemoryScope();
        await dc.beginDialog('test');
        const memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        assert(memory.isDialog == true);
    });

    it('ThisMemoryScope should overwrite active dialogs memory.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new ThisMemoryScope();
        await dc.beginDialog('container');
        scope.setMemory(dc, { foo: 'bar' });
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('ThisMemoryScope should raise error if setMemory() called without memory.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new ThisMemoryScope();
            await dc.beginDialog('container');
            scope.setMemory(dc, undefined);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('ThisMemoryScope should raise error if setMemory() called without active dialog.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new ThisMemoryScope();
            scope.setMemory(dc, { foo: 'bar' });
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('ThisMemoryScope should raise error if delete() called.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new ThisMemoryScope();
            await scope.delete(dc);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('TurnMemoryScope should persist changes to turn state.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new TurnMemoryScope();
        let memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        memory.foo = 'bar';
        memory = scope.getMemory(dc);
        assert(memory.foo == 'bar');
    });

    it('TurnMemoryScope should overwrite values in turn state.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new TurnMemoryScope();
        scope.setMemory(dc, { foo: 'bar' });
        const memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('TurnMemoryScope should raise error when setMemory() called without memory.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new TurnMemoryScope();
            scope.setMemory(dc, undefined);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('TurnMemoryScope should raise error when delete() called.', async function() {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new TurnMemoryScope();
            await scope.delete(dc);
        } catch (err) {
            error = true;
        }
        assert(error);
    });
});