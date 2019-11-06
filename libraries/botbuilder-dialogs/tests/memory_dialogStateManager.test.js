const { ConversationState, UserState, MemoryStorage, TurnContext, TestAdapter } = require('botbuilder-core');
const { DialogStateManager, Dialog, DialogSet, DialogContext, DialogContainer, ConversationMemoryScope, UserMemoryScope } =  require('../');
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
        this.dialogType = 'child';
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
        this.dialogType = 'container';
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

async function createConfiguredTestDc(storage) {
    if (!storage) { storage = new MemoryStorage() }
    const convoState = new ConversationState(storage);
    const userState = new UserState(storage);
    const config = DialogStateManager.createStandardConfiguration(convoState, userState);
    const dc = await createTestDc(convoState);
    dc.state.configuration = config;
    await dc.state.loadAllScopes();

    return dc;
}

async function createTestDc(convoState) {
        // Create a DialogState property, DialogSet and register the dialogs.
        const dialogState = convoState.createProperty('dialogs');
        const dialogs = new DialogSet(dialogState);
        const container = new TestContainer('container', new TestDialog('child', 'test message'));
        dialogs.add(container);

        // Create test context
        const context= new TurnContext(new TestAdapter(), beginMessage);
        const dc = await dialogs.createContext(context);

        // Start container dialog
        await dc.beginDialog('container');
        return dc;
}

describe('Memory - Dialog State Manager', function() {
    this.timeout(5000);
    
    it('Should create a standard configuration.', async function () {
        // Run test
        const config = DialogStateManager.createStandardConfiguration();
        assert(config, `No config returned`);
        assert(config.pathResolvers.length > 0, `No path resolvers`);
        assert(config.memoryScopes.length > 0, `No memory scopes`);
    });

    it('Should create a standard configuration with added conversation state.', async function () {
        // Run test
        let convoScopeFound = false;
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const config = DialogStateManager.createStandardConfiguration(convoState);
        config.memoryScopes.forEach(scope => {
            if (scope instanceof ConversationMemoryScope) { 
                convoScopeFound = true;
                assert(scope.name == 'conversation');
            }
        });
        assert(convoScopeFound, `no conversation scope added`);
    });

    it('Should create a standard configuration with added conversation and user state.', async function () {
        // Run test
        let convoScopeFound = false;
        let userScopeFound = false;
        const dc = await createConfiguredTestDc();
        const config = dc.state.configuration;
        config.memoryScopes.forEach(scope => {
            if (scope instanceof ConversationMemoryScope) { 
                convoScopeFound = true;
                assert(scope.name == 'conversation'); 
            }
            if (scope instanceof UserMemoryScope) { 
                userScopeFound = true; 
                assert(scope.name == 'user');
            }
        });
        assert(convoScopeFound, `no conversation scope added`);
        assert(userScopeFound, `no user scope added`);
    });

    it('Should create a standard configuration by default.', async function () {
        // Create test dc
        const convoState = new ConversationState(new MemoryStorage());
        const dc = await createTestDc(convoState);

        // Run test
        const config = dc.state.configuration;
        assert(config, `No config returned`);
        assert(config.pathResolvers.length > 0, `No path resolvers`);
        assert(config.memoryScopes.length > 0, `No memory scopes`);
    });

    it('Should support customized configurations.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const userState = new UserState(storage);
        const dc = await createTestDc(convoState);

        // Run test
        let convoScopeFound = false;
        let userScopeFound = false;
        dc.state.configuration = DialogStateManager.createStandardConfiguration(convoState, userState);
        const config = dc.state.configuration;
        config.memoryScopes.forEach(scope => {
            if (scope instanceof ConversationMemoryScope) { convoScopeFound = true }
            if (scope instanceof UserMemoryScope) { userScopeFound = true }
        });
        assert(convoScopeFound, `no conversation scope added`);
        assert(userScopeFound, `no user scope added`);
    });

    it('Should read & write values to TURN memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('turn.foo', 'bar');
        const value = dc.state.getValue('turn.foo');
        assert(value == 'bar', `value returned: ${value}`);
    });

    it('Should read values from the SETTINGS memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        let count = 0;
        for (const key in process.env) {
            const expected = process.env[key];
            if (typeof expected == 'string') {
                count++
                const value = dc.state.getValue(`settings.${key}`);
                assert (value == expected, `Value returned for "${key}": ${value}`);
            }
        }
        assert(count > 0, `no settings tested`);
    });

    it('Should read & write values to DIALOG memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('dialog.foo', 'bar');
        const value = dc.state.getValue('dialog.foo');
        assert(value == 'bar', `value returned: ${value}`);
    });

    it('Should read values from the CLASS memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        assert(dc.state.getValue('class.dialogType') === 'container');
        assert(dc.child.state.getValue('class.dialogType') === 'child');
    });

    it('Should read & write values to THIS memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('this.foo', 'bar');
        const value = dc.state.getValue('this.foo');
        assert(value == 'bar', `value returned: ${value}`);
    });

    it('Should read & write values to CONVERSATION memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('conversation.foo', 'bar');
        const value = dc.state.getValue('conversation.foo');
        assert(value == 'bar', `value returned: ${value}`);
    });

    it('Should read & write values to USER memory scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('user.foo', 'bar');
        const value = dc.state.getValue('user.foo');
        assert(value == 'bar', `value returned: ${value}`);
    });

    it('Should read & write values using $ alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('$.foo', 'bar');
        assert(dc.state.getValue('dialog.foo') == 'bar', `setValue() failed to use alias.`);
        assert(dc.state.getValue('$.foo') == 'bar', `getValue() failed to use alias.`);
    });

    it('Should read & write values using # alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('#.foo', 'bar');
        assert(dc.state.getValue('turn.recognized.intents.foo') == 'bar', `setValue() failed to use alias.`);
        assert(dc.state.getValue('#.foo') == 'bar', `getValue() failed to use alias.`);
    });

    it('Should read & write values using @@ alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('@@.foo', ['bar']);
        const value = dc.state.getValue('turn.recognized.entities.foo'); 
        assert(Array.isArray(value) && value.length == 1, `setValue() failed to use alias.`);
        assert(value[0] == 'bar');
    });

    it('Should read entities using @ alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('@@foo', ['foo']);
        dc.state.setValue('@@bar', [['bar']]);
        assert(dc.state.getValue('@foo') == 'foo', `Simple entities not returning.`);
        assert(dc.state.getValue('@bar') == 'bar', `Nested entities not returning.`);
    });

    it('Should write a entity using @ alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('@foo', 'bar');
        assert(dc.state.getValue('@foo') == 'bar', `Entity not round tripping.`);
    });

    it('Should read values using % alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        assert(dc.state.getValue('%dialogType') === 'container');
        assert(dc.child.state.getValue('%dialogType') === 'child');
    });

    it('Should delete values in a scope.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('turn.foo', 'bar');
        dc.state.deleteValue('turn.foo');
        const value = dc.state.getValue('turn.foo');
        assert(value == undefined, `value returned: ${value}`);
    });

    it('Should persist conversation & user values when saved.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Initialize state and save
        dc.state.setValue('user.name', 'test user');
        dc.state.setValue('conversation.foo', 'bar');
        await dc.state.saveAllChanges();

        // Create new dc and test loaded values
        dc = await createConfiguredTestDc(storage);
        assert(dc.state.getValue('user.name') == 'test user', `user state not saved`);
        assert(dc.state.getValue('conversation.foo') == 'bar', `conversation state not saved`);
    });

    it('Should delete backing conversation & user state.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Initialize state and save
        dc.state.setValue('user.name', 'test user');
        dc.state.setValue('conversation.foo', 'bar');
        await dc.state.saveAllChanges();

        // Create new dc and delete backing state
        dc = await createConfiguredTestDc(storage);
        await dc.state.deleteScopesMemory('user');
        await dc.state.deleteScopesMemory('conversation');
        assert(dc.state.getValue('user.name') == undefined, `user state not delete`);
        assert(dc.state.getValue('conversation.foo') == undefined, `conversation state not deleted`);

        // Double check
        dc = await createConfiguredTestDc(storage);
        assert(dc.state.getValue('user.name') == undefined, `user state deletion not persisted`);
        assert(dc.state.getValue('conversation.foo') == undefined, `conversation state deletion not persisted`);
    });

    // TODO: add more path unit tests...
});