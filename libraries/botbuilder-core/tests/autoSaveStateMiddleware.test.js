const assert = require('assert');
const { TurnContext, AutoSaveStateMiddleware, TestAdapter } = require('../lib');

const receivedMessage = { text: 'received', type: 'message' };

class BotStateMock {
    constructor(state) {
        this.state = state || {};
        this.assertForce = false;
        this.readCalled = false;
        this.writeCalled = false;
    }
    load(context, force) {
        assert(context, `BotStateMock.load() not passed context.`);
        if (this.assertForce) assert(force, `BotStateMock.load(): force not set.`);
        this.readCalled = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.state), Math.random() * 50);
        });
    }

    saveChanges(context, force) {
        assert(context, `BotStateMock.saveChanges() not passed context.`);
        if (this.assertForce) assert(force, `BotStateMock.saveChanges(): force not set.`);
        this.writeCalled = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), Math.random() * 50);
        });
    }
}

describe(`AutoSaveStateMiddleware`, function () {
    this.timeout(5000);

    const adapter = new TestAdapter();
    const context = new TurnContext(adapter, receivedMessage);
    it(`should add() and call loadAll() on a single BotState plugin.`, async function () {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new AutoSaveStateMiddleware().add(fooState);
        await set.botStateSet.loadAll(context);
    });

    it(`should add() and call loadAll() on multiple BotState plugins.`, async function () {
        const fooState = new BotStateMock({ foo: 'bar' });
        const barState = new BotStateMock({ bar: 'foo' })
        const set = new AutoSaveStateMiddleware().add(fooState, barState);
        await set.botStateSet.loadAll(context);
    });

    it(`should add() and call saveAllChanges() on a single BotState plugin.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new AutoSaveStateMiddleware().add(fooState);
        set.botStateSet.saveAllChanges(context).then(() => {
            assert(fooState.writeCalled, `write not called for plugin.`);
            done();
        });
    });

    it(`should add() and call saveAllChanges() on multiple BotState plugins.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const barState = new BotStateMock({ bar: 'foo' })
        const set = new AutoSaveStateMiddleware().add(fooState, barState);
        set.botStateSet.saveAllChanges(context).then((items) => {
            assert(fooState.writeCalled || barState.writeCalled, `write not called for either plugin.`);
            assert(fooState.writeCalled, `write not called for 'fooState' plugin.`);
            assert(barState.writeCalled, `write not called for 'barState' plugin.`);
            done();
        });
    });

    it(`should pass 'force' flag through in loadAll() call.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        fooState.assertForce = true;
        const set = new AutoSaveStateMiddleware().add(fooState);
        set.botStateSet.loadAll(context, true).then(() => done());
    });

    it(`should pass 'force' flag through in saveAllChanges() call.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        fooState.assertForce = true;
        const set = new AutoSaveStateMiddleware().add(fooState);
        set.botStateSet.saveAllChanges(context, true).then(() => done());
    });

    it(`should work as a middleware plugin.`, async function () {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new AutoSaveStateMiddleware().add(fooState);
        await set.onTurn(context, () => Promise.resolve());
        assert(fooState.writeCalled, `saveAllChanges() not called.`);
    });

    it(`should support plugins passed to constructor.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new AutoSaveStateMiddleware(fooState);
        set.onTurn(context, () => Promise.resolve())
            .then(() => {
                assert(fooState.writeCalled, `saveAllChanges() not called.`);
                done();
            });
    });

    it(`should throw exception if invalid plugin passed in.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        try {
            const set = new AutoSaveStateMiddleware(fooState, { read: () => { } });
            assert(false, `bogus plugin added to set.`);
        } catch (err) {
            done();
        }
    });

    it(`should not add any BotState on construction if none are passed in.`, function (done) {
        const middleware = new AutoSaveStateMiddleware();
        assert(middleware.botStateSet.botStates.length === 0, `should not have added any BotState.`);
        done();
    });
});
