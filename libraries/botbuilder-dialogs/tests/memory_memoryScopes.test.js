const { ConversationState, UserState, MemoryStorage, TurnContext, TestAdapter } = require('botbuilder-core');
const { ClassMemoryScope, ConversationMemoryScope, DialogMemoryScope, 
    SettingsMemoryScope, ThisMemoryScope, TurnMemoryScope, UserMemoryScope,
    Dialog, DialogSet, DialogContext, DialogContainer } =  require('../');
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

    it('ClassMemoryScope should find registered dialog.', async function () {
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
    });

    it('ClassMemoryScope should not allow setMemory() call.', async function () {
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

    it('ClassMemoryScope should ignore load() and saveChanges() calls.', async function () {
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

    it('ClassMemoryScope should not allow delete() call.', async function () {
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


    it('ConversationMemoryScope should return conversation state.', async function () {
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Initialize conversation state
        const state = convoState.createProperty('conversation');
        await state.set(context, { foo: 'bar' });

        // Run test
        const scope = new ConversationMemoryScope(convoState);
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('UserMemoryScope should raise error if not loaded.', async function () {
        // Initialize user state
        const storage = new MemoryStorage();
        let context = new TurnContext(new TestAdapter(), beginMessage);
        let userState = new UserState(storage);
        await userState.createProperty('user').set(context, { foo: 'bar' });
        await userState.saveChanges(context);

        // Replace context and convoState with new instances
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);

        // Create a DialogState property, DialogSet and register the dialogs.
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new UserMemoryScope(userState);
            const memory = scope.getMemory(dc);
        } catch (err) {
            error = true;
        }
        assert(error, `state returned`);
    });

    it('UserMemoryScope should return state once loaded.', async function () {
        // Initialize user state
        const storage = new MemoryStorage();
        let context = new TurnContext(new TestAdapter(), beginMessage);
        let userState = new UserState(storage);
        await userState.createProperty('user').set(context, { foo: 'bar' });
        await userState.saveChanges(context);

        // Replace context and convoState with new instances
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);

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
        await scope.load(dc);
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('UserMemoryScope should save any changes.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        let context = new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let userState = new UserState(storage);
        const scope = new UserMemoryScope(userState);
        await scope.load(dc);
        scope.setMemory(dc, { foo: 'bar' });
        await scope.saveChanges(dc);

        // Ensure changes saved
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);
        const memory = await userState.createProperty('user').get(context);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('UserMemoryScope should delete existing state.', async function () {
        // Initialize user state
        const storage = new MemoryStorage();
        let context = new TurnContext(new TestAdapter(), beginMessage);
        let userState = new UserState(storage);
        await userState.createProperty('user').set(context, { foo: 'bar' });
        await userState.saveChanges(context);

        // Replace context and convoState with new instances
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);

        // Create a DialogState property, DialogSet and register the dialogs.
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const dc = await dialogs.createContext(context);

        // Check state
        const scope = new UserMemoryScope(userState);
        await scope.load(dc);
        let memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');

        // Delete existing memory
        await scope.delete(dc);
        context = new TurnContext(new TestAdapter(), beginMessage);
        userState = new UserState(storage);
        memory = await userState.createProperty('user').get(context);
        assert(memory == undefined, `state not deleted`);
    });

    it('DialogMemoryScope should return containers state.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('container');
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.isContainer == true);
    });

    it('DialogMemoryScope should return parent containers state for children.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container', new TestDialog('child', 'test message'));
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('DialogMemoryScope should return childs state when no parent.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('test');
        const memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        assert(memory.isDialog == true);
    });

    it('DialogMemoryScope should raise error when no active dialog.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new DialogMemoryScope();
            const memory = scope.getMemory(dc);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('DialogMemoryScope should overwrite parents memory.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container', new TestDialog('child', 'test message'));
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('DialogMemoryScope should overwrite active dialogs memory.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new DialogMemoryScope();
        await dc.beginDialog('container');
        scope.setMemory(dc, { foo: 'bar' });
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('DialogMemoryScope should raise error if setMemory() called without memory.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('DialogMemoryScope should raise error if setMemory() called without active dialog.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new DialogMemoryScope();
            scope.setMemory(dc, { foo: 'bar' });
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('DialogMemoryScope should raise error if delete() called.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('SettingsMemoryScope should return clone of process env.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState).add(new TestDialog('test', 'test message'));

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new SettingsMemoryScope();
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `settings not returned`);
        let count = 0;
        for (const key in process.env) {
            if (typeof process.env[key] == 'string') {
                assert(memory[key] == process.env[key]);
                count++;
            }
        }
        assert(count > 0, `no settings found.`);
    });

    it('ThisMemoryScope should return active dialogs state.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new ThisMemoryScope();
        await dc.beginDialog('test');
        const memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        assert(memory.isDialog == true);
    });

    it('ThisMemoryScope should raise error when no active dialog.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        let error = false;
        try {
            const scope = new ThisMemoryScope();
            const memory = scope.getMemory(dc);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('ThisMemoryScope should overwrite active dialogs memory.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new ThisMemoryScope();
        await dc.beginDialog('container');
        scope.setMemory(dc, { foo: 'bar' });
        const memory = scope.getMemory(dc);
        assert(typeof memory == 'object', `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('ThisMemoryScope should raise error if setMemory() called without memory.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('ThisMemoryScope should raise error if setMemory() called without active dialog.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('ThisMemoryScope should raise error if delete() called.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container');
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('TurnMemoryScope should persist changes to turn state.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new TurnMemoryScope();
        let memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        memory.foo = 'bar';
        memory = scope.getMemory(dc);
        assert(memory.foo == 'bar');
    });

    it('TurnMemoryScope should overwrite values in turn state.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Run test
        const scope = new TurnMemoryScope();
        scope.setMemory(dc, { foo: 'bar' });
        const memory = scope.getMemory(dc);
        assert(typeof memory != undefined, `state not returned`);
        assert(memory.foo == 'bar');
    });

    it('TurnMemoryScope should raise error when setMemory() called without memory.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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

    it('TurnMemoryScope should raise error when delete() called.', async function () {
        // Create a DialogState property, DialogSet and register the dialogs.
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const dialog = new TestDialog('test', 'test message');
        dialogs.add(dialog);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
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