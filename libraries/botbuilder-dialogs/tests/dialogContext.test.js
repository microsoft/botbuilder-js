const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
            context.responded = true;
        });
    }
}

describe('DialogContext', function() {
    this.timeout(5000);

    it('should begin() a new dialog.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args) {
                assert(dc);
                assert(args === 'z'); 
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a', 'z');
    });

    it('should return error if begin() called with invalid dialog ID.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args) { }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);

        dc.begin('b').catch((err) => {
            assert(err);
            done();
        });
    });

    it('should pass prompt() args to dialog.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.prompt === 'foo');
                assert(args.speak === 'say foo'); 
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.prompt('a', 'foo', { speak: 'say foo' });
    });

    it('should pass undefined prompt() to dialog.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.prompt === undefined);
                assert(args.speak === 'say foo'); 
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.prompt('a', undefined, { speak: 'say foo' });
    });

    it('should pass choice array to prompt() to dialog.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.prompt === 'foo');
                assert(Array.isArray(args.choices)); 
                assert(args.choices.length === 3); 
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.prompt('a', 'foo', ['red', 'green', 'blue']);
    });

    it('should continue() execution of a dialog.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                assert(dc);
                return dc.context.sendActivity(`foo`);
            },
            function (dc) {
                assert(dc);
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const dc2 = dialogs.createContext(context, state);
            return dc2.continue();
        });
    });

    it('should return an error if dialog not found when continue() called.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                assert(dc);
                return dc.context.sendActivity(`foo`);
            },
            function (dc) {
                assert(false, `shouldn't continue`);
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            assert(dc.activeDialog && dc.activeDialog.id === 'a');
            dc.activeDialog.id = 'b';
            const dc2 = dialogs.createContext(context, state);
            return dc2.continue().catch((err) => {
                assert(err);
                done();
            });
        });
    });

    it(`should automatically call end() if dialog doesn't support Dialog.dialogContinue().`, function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', {
            dialogBegin: (dc, args) => {
                return dc.context.sendActivity(continueMessage);
            }
        });

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const dc2 = dialogs.createContext(context, state);
            return dc2.continue().then(() => {
                assert(dc2.activeDialog === undefined);
                done();
            });
        });
    });

    it('should return to parent dialog when end() called.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                return dc.begin('b');
            },
            function (dc) {
                done();
            }
        ]);

        dialogs.add('b', [
            function (dc) {
                return dc.end();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a');
    });

    it('should return a value to parent when end() called with a value.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                return dc.begin('b');
            },
            function (dc, value) {
                assert(value === 120);
                done();
            }
        ]);

        dialogs.add('b', [
            function (dc) {
                return dc.end(120);
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a');
    });
    
    it(`should return to parents parent when end() called and parent doesn't support Dialog.dialogResume().`, function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', {
            dialogBegin: (dc, args) => {
                return dc.begin('b');
            }
        });

        dialogs.add('b', [
            function (dc) {
                return dc.end();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            assert(dc.activeDialog === undefined);
            done();
        });
    });

    it(`should return an error if end() returns to a dialog that can't be found.`, function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                return dc.begin('b');
            },
            function (dc) {
                assert(false, `shouldn't be called`);
            }
        ]);

        dialogs.add('b', [
            function (dc) {
                return dc.context.sendActivity(`foo`);
            },
            function (dc) {
                return dc.end();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            assert(dc.activeDialog && dc.activeDialog.id === 'b');
            dc.activeDialog.id = 'c';
            const dc2 = dialogs.createContext(context, state);
            return dc2.continue().catch((err) => {
                assert(err);
                done();
            });
        });
    });

    it(`should ignore additional calls to end().`, function (done) {
        const dialogs = new DialogSet();
        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.end().then(() => {
            assert(dc.activeDialog === undefined);
            done();
        });
    });

    it(`should endAll() dialogs.`, function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                return dc.begin('b');
            },
            function (dc) {
                assert(false, `shouldn't be called`);
            }
        ]);

        dialogs.add('b', [
            function (dc) {
                return dc.context.sendActivity(`foo`);
            },
            function (dc) {
                return dc.end();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            assert(dc.stack.length > 0, `Unexpected stack length.`);
            dc.endAll();
            assert(dc.stack.length == 0, `Didn't clear stack.`);
            dc.endAll();    // <- shouldn't throw exception
            done();
        });
    });

    it(`should replace() dialog.`, function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args) {
                return dc.replace('b', args);
            }
        ]);

        dialogs.add('b', [
            function (dc, args) {
                assert(args === 'z');
                return dc.context.sendActivity(`foo`);
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a', 'z').then(() => {
            assert(dc.stack.length == 1);
            assert(dc.stack[0].id == 'b');
            done();
        });
    });

    it(`should return error if stack empty when replace() called.`, function (done) {
        const dialogs = new DialogSet();
        dialogs.add('b', [
            function (dc, args) {
                assert(false, `shouldn't have started dialog`);
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.replace('b').catch((err) => {
            assert(err);
            done();
        });
    });
});
