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

    it('Should raise an error when a child DC is configured.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        const convoState = new ConversationState(storage);
        const userState = new UserState(storage);
        const dc = await createTestDc(convoState);

        // Run test
        let error = false;
        try {
            dc.child.state.configuration = DialogStateManager.createStandardConfiguration(convoState, userState);
        } catch (err) {
            error = true;
        }
        assert(error);
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
                const value = dc.state.getValue(`settings["${key}"]`);
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
        dc.state.setValue('$foo', 'bar');
        assert(dc.state.getValue('dialog.foo') == 'bar', `setValue() failed to use alias.`);
        assert(dc.state.getValue('$foo') == 'bar', `getValue() failed to use alias.`);
    });

    it('Should read & write values using # alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('#foo', 'bar');
        assert(dc.state.getValue('turn.recognized.intents.foo') == 'bar', `setValue() failed to use alias.`);
        assert(dc.state.getValue('#foo') == 'bar', `getValue() failed to use alias.`);
    });

    it('Should read & write values using @@ alias.', async function () {
        // Create test dc
        const dc = await createConfiguredTestDc();

        // Run test
        dc.state.setValue('@@foo', ['bar']);
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

        dc.state.setValue('turn.recognized.entities.single', ['test1', 'test2', 'test3']);
        dc.state.setValue('turn.recognized.entities.double', [['testx', 'testy', 'testz'], ['test1', 'test2', 'test3']]);
        assert.equal(dc.state.getValue('@single'), 'test1');
        assert.equal(dc.state.getValue('@double'), 'testx');
        assert.equal(dc.state.getValue('turn.recognized.entities.single.first()'), 'test1');
        assert.equal(dc.state.getValue('turn.recognized.entities.double.first()'), 'testx');

        dc.state.setValue('turn.recognized.entities.single', [{name: 'test1'}, {name: 'test2'}, {name: 'test3'}]);
        dc.state.setValue('turn.recognized.entities.double', [[{name: 'testx'}, {name: 'testy'}, {name: 'testz'}], [{name: 'test1'}, {name: 'test2'}, {name: 'test3'}]]);
        assert.equal(dc.state.getValue('@single.name'), 'test1');
        assert.equal(dc.state.getValue('@double.name'), 'testx');
        assert.equal(dc.state.getValue('turn.recognized.entities.single.first().name'), 'test1');
        assert.equal(dc.state.getValue('turn.recognized.entities.double.first().name'), 'testx');
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

    it('Should return default value when getValue() called with empty path.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        assert(dc.state.getValue('', 'default') == 'default');
    });

    it('Should support passing a function to getValue() for the default.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        assert(dc.state.getValue('', () => 'default') == 'default');
    });

    it('Should raise an error if getValue() called with an invalid scope.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let = error = false;
        try {
            dc.state.getValue('foo.bar');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error if getValue() called with an invalid scope.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let = error = false;
        try {
            dc.state.getValue('foo.bar');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error if setValue() called with missing path.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let = error = false;
        try {
            dc.state.setValue('', 'bar');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error if setValue() called with an invalid scope.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let = error = false;
        try {
            dc.state.setValue('foo', 'bar');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should overwrite memory when setValue() called with just a scope.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn',  { foo: 'bar' });
        assert(dc.state.getValue('turn.foo') == 'bar');
    });

    it('Should raise an error if deleteValue() called with < 2 path path.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let = error = false;
        try {
            dc.state.deleteValue('conversation');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error if deleteValue() called with an invalid scope.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let = error = false;
        try {
            dc.state.deleteValue('foo.bar');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should read & write array values.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo',  ['bar']);
        assert(dc.state.getValue('turn.foo[0]') == 'bar');
    });

    it('Should delete array values by index.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.test',  ['foo', 'bar']);
        dc.state.deleteValue('turn.test[0]')
        assert(dc.state.getValue('turn.test[0]') == 'bar');
    });

    it('Should ignore array deletions that are out of range.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.test', []);
        dc.state.deleteValue('turn.test[0]')
        assert(dc.state.getValue('turn.test').length == 0);
    });

    it('Should ignore property deletions off non-object properties.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', []);
        dc.state.deleteValue('turn.foo.bar');
        assert(dc.state.getValue('turn.foo').length == 0);
        dc.state.setValue('turn.bar', 'test');
        dc.state.deleteValue('turn.bar.foo');
        assert(dc.state.getValue('turn.bar') == 'test');
    });

    it('Should ignore property deletions of missing object properties.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', { 'test': 'test' });
        dc.state.deleteValue('turn.foo.bar');
        let count = 0;
        const value = dc.state.getValue('turn.foo');
        for (const key in value) {
            count++;
        }
        assert(count == 1);
    });

    it('Should resolve nested expressions.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.addresses', { 
            'work': { 
                street: 'one microsoft way', 
                city: 'Redmond',
                state: 'wa',
                zip: '98052' 
            } 
        });
        dc.state.setValue('turn.addressKeys', ['work'])
        dc.state.setValue('turn.preferredAddress', 0);
        const value = dc.state.getValue('turn.addresses[turn.addressKeys[turn.preferredAddress]].zip');
        assert(value == '98052');
    });

    it('Should find a property quoted with single quotes.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.addresses', { 
            'work': { 
                street: 'one microsoft way', 
                city: 'Redmond',
                state: 'wa',
                zip: '98052' 
            } 
        });
        const value = dc.state.getValue(`turn.addresses['work'].zip`);
        assert(value == '98052');
    });

    it('Should find a property quoted with double quotes.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.addresses', { 
            'work': { 
                street: 'one microsoft way', 
                city: 'Redmond',
                state: 'wa',
                zip: '98052' 
            } 
        });
        const value = dc.state.getValue(`turn.addresses["work"].zip`);
        assert(value == '98052');
    });

    it('Should find a property containing embedded quotes.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.addresses', { 
            '"work"': { 
                street: 'one microsoft way', 
                city: 'Redmond',
                state: 'wa',
                zip: '98052' 
            } 
        });
        const value = dc.state.getValue(`turn.addresses['\\"work\\"'].zip`);
        assert(value == '98052');
    });

    it('Should raise an error for paths with miss-matched quotes.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let error = false;
        try {
            dc.state.setValue('turn.addresses', { 
                'work': { 
                    street: 'one microsoft way', 
                    city: 'Redmond',
                    state: 'wa',
                    zip: '98052' 
                } 
            });
            dc.state.getValue(`turn.addresses['work"].zip`);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error for segments with invalid path chars.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let error = false;
        try {
            dc.state.setValue('turn.addresses', { 
                '~work': { 
                    street: 'one microsoft way', 
                    city: 'Redmond',
                    state: 'wa',
                    zip: '98052' 
                } 
            });
            dc.state.getValue(`turn.addresses.~work.zip`);
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error for assignments to a negative array index.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let error = false;
        try {
            dc.state.setValue(`turn.foo[-1]`, 'test');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error for array assignments to non-array values.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let error = false;
        try {
            dc.state.setValue('turn.foo', 'bar');
            dc.state.setValue(`turn.foo[3]`, 'test');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should raise an error for un-matched brackets.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let error = false;
        try {
            dc.state.setValue(`turn.foo[0`, 'test');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

    it('Should alow indexer based path lookups.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', 'bar');
        const value = dc.state.getValue('["turn"].["foo"]');
        assert(value == 'bar');
    });

    it('Should return "undefined" for index lookups again non-arrays.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', 'bar');
        assert(dc.state.getValue('turn.foo[2]') == undefined);
    });

    it('Should return "undefined" when first() called for empty array.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', []);
        assert(dc.state.getValue('turn.foo.first()') == undefined);
    });

    it('Should return "undefined" when first() called for empty nested array.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', [[]]);
        assert(dc.state.getValue('turn.foo.first()') == undefined);
    });

    it('Should return "undefined" for a missing segment.', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        dc.state.setValue('turn.foo', 'bar');
        const value = dc.state.getValue('turn..foo');
        assert(value == undefined);
    });

    it('Should raise an error for paths starting with a ".".', async function () {
        // Create test dc
        const storage = new MemoryStorage();
        let dc = await createConfiguredTestDc(storage);

        // Run test
        let error = false;
        try {
            dc.state.setValue('.turn.foo', 'bar');
        } catch (err) {
            error = true;
        }
        assert(error);
    });

});