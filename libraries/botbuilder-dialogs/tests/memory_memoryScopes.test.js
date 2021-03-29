const assert = require('assert');
const { ConversationState, UserState, MemoryStorage, TurnContext, TestAdapter } = require('botbuilder-core');
const {
    ClassMemoryScope,
    ConversationMemoryScope,
    DialogMemoryScope,
    DialogContextMemoryScope,
    SettingsMemoryScope,
    ThisMemoryScope,
    TurnMemoryScope,
    UserMemoryScope,
    Dialog,
    DialogSet,
    DialogContext,
    DialogContainer,
    DialogTurnStateConstants,
} = require('../');

const beginMessage = {
    text: `begin`,
    type: 'message',
    channelId: 'test',
    from: { id: 'user' },
    recipient: { id: 'bot' },
    conversation: { id: 'convo1' },
};

class TestDialog extends Dialog {
    constructor(id, message) {
        super(id);
        this.message = message;
        this.expression = {
            tryGetValue: (state) => {
                return { value: 'resolved value' };
            },
        };
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

describe('Memory - Memory Scopes', function () {
    this.timeout(5000);

    describe('ClassMemoryScope', function () {
        it('should find registered dialog.', async function () {
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
                dialogStack: [{ id: 'test', state: {} }],
            });
            const dc = await dialogs.createContext(context);

            // Run test
            const scope = new ClassMemoryScope();
            const memory = scope.getMemory(dc);
            assert(typeof memory == 'object', `memory not returned`);
            assert(memory.message == 'test message');
            assert(memory.expression == 'resolved value');
        });

        it('should not allow setMemory() call.', async function () {
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
                dialogStack: [{ id: 'test', state: {} }],
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

        it('should ignore load() and saveChanges() calls.', async function () {
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
                dialogStack: [{ id: 'test', state: {} }],
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

        it('should not allow delete() call.', async function () {
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
                dialogStack: [{ id: 'test', state: {} }],
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
    });

    describe('ConversationMemoryScope', function () {
        it('should return conversation state.', async function () {
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
    });

    describe('UserMemoryScope', function () {
        it('should not return state if not loaded.', async function () {
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

        it('should return state once loaded.', async function () {
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
    });

    describe('DialogMemoryScope', function () {
        it('should return containers state.', async function () {
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

        it('should return parent containers state for children.', async function () {
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

        it('should return childs state when no parent.', async function () {
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

        it('should overwrite parents memory.', async function () {
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

        it('should overwrite active dialogs memory.', async function () {
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

        it('should raise error if setMemory() called without memory.', async function () {
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

        it('should raise error if delete() called.', async function () {
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
    });

    describe('SettingsMemoryScope', function () {
        it('should get settings from turnState and initial settings.', async function () {
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
            assert.strictEqual(typeof memory, 'object', `settings not returned`);
            assert.strictEqual(memory.string, 'test');
            assert.strictEqual(memory.int, 3);
            assert.strictEqual(memory.array[0], 'zero');
            assert.strictEqual(memory.array[1], 'one');
            assert.strictEqual(memory.array[2], 'two');
            assert.strictEqual(memory.array[3], 'three');
            assert.strictEqual(dc.state.getValue('settings.fakeArray.0'), 'zero');
            assert.strictEqual(dc.state.getValue('settings.fakeArray.1'), 'one');
            assert.strictEqual(dc.state.getValue('settings.fakeArray.2'), 'two');
            assert.strictEqual(dc.state.getValue('settings.fakeArray.3'), 'three');
            assert.strictEqual(dc.state.getValue('settings.fakeArray.zzz'), 'cat');
        });

        it('should get settings from initial settings.', async function () {
            // Create a DialogState property, DialogSet and register the dialogs.
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogs');
            const dialogs = new DialogSet(dialogState).add(new TestDialog('test', 'test message'));

            // Create test context
            const context = new TurnContext(new TestAdapter(), beginMessage);
            const dc = await dialogs.createContext(context);

            // Run test
            const scope = new SettingsMemoryScope({ initial: 'settings' });
            const memory = scope.getMemory(dc);
            assert.strictEqual(typeof memory, 'object', `settings not returned`);
            assert.strictEqual(memory.initial, 'settings');
        });

        it('should get settings from configuration.', async function () {
            // Create a DialogState property, DialogSet and register the dialogs.
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogs');
            const dialogs = new DialogSet(dialogState).add(new TestDialog('test', 'test message'));

            // Create test context
            const context = new TurnContext(new TestAdapter(), beginMessage);
            const dc = await dialogs.createContext(context);
            const configuration = {
                simple: 'test',
                'object:simple': 'test',
                'array:0': 'one',
                'array:1': 'two',
                'object:array:0': 'one',
                'object:array:1': 'two',
            };
            dc.context.turnState.set(DialogTurnStateConstants.configuration, configuration);

            // Run test
            const scope = new SettingsMemoryScope();
            const memory = scope.getMemory(dc);
            assert.strictEqual(typeof memory, 'object', `settings not returned`);
            assert.strictEqual(memory.simple, 'test');
            assert.strictEqual(memory.object.simple, 'test');
            assert(Array.isArray(memory.array));
            assert.strictEqual(memory.array[0], 'one');
            assert.strictEqual(memory.array[1], 'two');
            assert(Array.isArray(memory.object.array));
            assert.strictEqual(memory.object.array[0], 'one');
            assert.strictEqual(memory.object.array[1], 'two');
        });

        it('should get settings from configuration and environment variables.', async function () {
            // Create a DialogState property, DialogSet and register the dialogs.
            const convoState = new ConversationState(new MemoryStorage());
            const dialogState = convoState.createProperty('dialogs');
            const dialogs = new DialogSet(dialogState).add(new TestDialog('test', 'test message'));

            // Create test context
            const context = new TurnContext(new TestAdapter(), beginMessage);
            const dc = await dialogs.createContext(context);
            const configuration = {
                simple: 'test',
                to_be_overriden: 'one',
                'object:simple': 'test',
                'array:0': 'one',
                'array:1': 'two',
                'object:array:0': 'one',
                'object:array:1': 'two',
            };
            dc.context.turnState.set(DialogTurnStateConstants.configuration, configuration);
            process.env['to_be_overridden'] = 'two';

            // Run test
            const scope = new SettingsMemoryScope();
            const memory = scope.getMemory(dc);
            assert.strictEqual(typeof memory, 'object', `settings not returned`);
            assert.strictEqual(memory.simple, 'test');
            assert.strictEqual(memory.object.simple, 'test');
            assert(Array.isArray(memory.array));
            assert.strictEqual(memory.array[0], 'one');
            assert.strictEqual(memory.array[1], 'two');
            assert(Array.isArray(memory.object.array));
            assert.strictEqual(memory.object.array[0], 'one');
            assert.strictEqual(memory.object.array[1], 'two');
            assert.strictEqual(memory.to_be_overridden, 'two');
        });
    });

    describe('ThisMemoryScope', function () {
        it('should return active dialogs state.', async function () {
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

        it('should overwrite active dialogs memory.', async function () {
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

        it('should raise error if setMemory() called without memory.', async function () {
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

        it('should raise error if setMemory() called without active dialog.', async function () {
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

        it('should raise error if delete() called.', async function () {
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
    });

    describe('TurnMemoryScope', function () {
        it('should persist changes to turn state.', async function () {
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

        it('should overwrite values in turn state.', async function () {
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

        it('should raise error when setMemory() called without memory.', async function () {
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

        it('should raise error when delete() called.', async function () {
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

    describe('DialogContextMemoryScope', function () {
        it('should get dialog context.', async function () {
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
                dialogStack: [{ id: 'test', state: {} }],
            });
            const dc = await dialogs.createContext(context);

            // Run test
            const scope = new DialogContextMemoryScope();
            const memory = scope.getMemory(dc);

            assert.strictEqual(memory.activeDialog, 'test');
            assert.strictEqual(memory.stack.length, 1);
            assert.strictEqual(memory.parent, undefined);
        });

        it('should not allow setMemory() call.', async function () {
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
                dialogStack: [{ id: 'test', state: {} }],
            });
            const dc = await dialogs.createContext(context);

            // Run test
            assert.throws(() => {
                const scope = new DialogContextMemoryScope();
                scope.setMemory(dc, {});
            });
        });
    });
});
