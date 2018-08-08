const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const { BotStateSet, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message' };

class BotStateMock {
    constructor(state) {
        this.state = state || {}; 
        this.assertForce = false;
        this.readCalled = false;
        this.writeCalled = false;
    }
    read(context, force) {
        assert(context, `BotStateMock.read() not passed context.`);
        if (this.assertForce) assert(force, `BotStateMock.read(): force not set.`);
        this.readCalled = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.state), Math.random() * 50);
        });
    }

    write(context, force) {
        assert(context, `BotStateMock.write() not passed context.`);
        if (this.assertForce) assert(force, `BotStateMock.write(): force not set.`);
        this.writeCalled = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), Math.random() * 50);
        });
    }
}

describe(`BotStateSet`, function () {
    this.timeout(5000);

    const adapter = new TestAdapter();
    const context = new TurnContext(adapter, receivedMessage);
    it(`should use() and call readAll() on a single BotState plugin.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new BotStateSet().use(fooState);
        set.readAll(context).then((items) => {
            assert(Array.isArray(items), `items array not passed back.`)
            assert(items.length == 1, `wrong length of returned items array.`);
            assert(items[0].foo === 'bar', `wrong object returned in items array.`);
            done();
        });
    });

    it(`should use() and call readAll() on multiple BotState plugins.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const barState = new BotStateMock({ bar: 'foo' })
        const set = new BotStateSet().use(fooState, barState);
        set.readAll(context).then((items) => {
            assert(Array.isArray(items), `items array not passed back.`)
            assert(items.length == 2, `wrong length of returned items array.`);
            assert(items[0].foo === 'bar', `wrong object returned in items array.`);
            assert(items[1].bar === 'foo', `wrong object returned in items array.`);
            done();
        });
    });

    it(`should use() and call writeAll() on a single BotState plugin.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new BotStateSet().use(fooState);
        set.writeAll(context).then(() => {
            assert(fooState.writeCalled, `write not called for plugin.`);
            done();
        });
    });

    it(`should use() and call writeAll() on multiple BotState plugins.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const barState = new BotStateMock({ bar: 'foo' })
        const set = new BotStateSet().use(fooState, barState);
        set.writeAll(context).then((items) => {
            assert(fooState.writeCalled || barState.writeCalled, `write not called for either plugin.`);
            assert(fooState.writeCalled, `write not called for 'fooState' plugin.`);
            assert(barState.writeCalled, `write not called for 'barState' plugin.`);
            done();
        });
    });
    
    it(`should pass 'force' flag through in readAll() call.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        fooState.assertForce = true;
        const set = new BotStateSet().use(fooState);
        set.readAll(context, true).then(() => done());
    });

    it(`should pass 'force' flag through in writeAll() call.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        fooState.assertForce = true;
        const set = new BotStateSet().use(fooState);
        set.writeAll(context, true).then(() => done());
    });

    it(`should work as a middleware plugin.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new BotStateSet().use(fooState);
        set.onTurn(context, () => Promise.resolve())
           .then(() => {
                assert(fooState.readCalled, `readAll() not called.`);
                assert(fooState.writeCalled, `writeAll() not called.`);
                done();
           });
    });

    it(`should support plugins passed to constructor.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        const set = new BotStateSet(fooState);
        set.onTurn(context, () => Promise.resolve())
           .then(() => {
                assert(fooState.readCalled, `readAll() not called.`);
                assert(fooState.writeCalled, `writeAll() not called.`);
                done();
           });
    });

    it(`should throw exception if invalid plugin passed in.`, function (done) {
        const fooState = new BotStateMock({ foo: 'bar' });
        try {
            const set = new BotStateSet(fooState, { read: () => {} });
            assert(false, `bogus plugin added to set.`);
        } catch (err) {
            done();
        }
    });
});
