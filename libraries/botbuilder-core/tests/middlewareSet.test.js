const assert = require('assert');
const { BotAdapter, MiddlewareSet, TurnContext } = require('../');

const testMessage = { text: 'test', type: 'message' };

class SimpleAdapter extends BotAdapter { }

describe(`MiddlewareSet`, function () {
    this.timeout(5000);

    let order = '';
    let calls = 0;
    function middleware(char) {
        return (context, next) => {
            assert(context, `middleware[${calls}]: context object missing.`);
            assert(next, `middleware[${calls}]: next() function missing.`);
            calls++;
            order += char;
            return next();
        };
    }

    const set = new MiddlewareSet();
    it(`should use() middleware individually.`, function (done) {
        set.use(middleware('a')).use(middleware('b'));
        done();
    });

    it(`should use() a list of middleware.`, function (done) {
        set.use(middleware('c'), middleware('d'), middleware('e'));
        done();
    });

    it(`should run all middleware in order.`, function (done) {
        calls = 0;
        order = '';
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        set.run(context, () => {
            assert(calls === 5, `only "${calls} of 5" middleware called.`);
            assert(order === 'abcde', `middleware executed out of order "${order}".`)
        }).then(() => done());
    });

    it(`should run a middleware set added to another middleware set.`, function (done) {
        calls = 0;
        order = '';
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        const set2 = new MiddlewareSet(set);
        set2.run(context, () => {
            assert(calls === 5, `only "${calls} of 5" middleware called.`);
            assert(order === 'abcde', `middleware executed out of order "${order}".`)
        }).then(() => done());
    });
    
    it(`should run middleware with a leading and trailing edge.`, function (done) {
        let edge = '';
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        new MiddlewareSet()
            .use((context, next) => {
                edge += 'a';
                return next().then(() => {
                    edge += 'c';
                });
            })
            .run(context, () => {
                edge += 'b';
            })
            .then(() => {
                assert(edge === 'abc', `edges out of order "${edge}".`);
                done();
            });
    });

    it(`should support middleware added as an object.`, function (done) {
        let called = false;
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        new MiddlewareSet()
            .use({
                onTurn: (context, next) => {
                    called = true;
                    return next();
                }
            })
            .run(context, () => {
                assert(called, `onProcessRequest() not called.`);
                done();
            });
    });

    it(`not calling next() should intercept other middleware and bot logic.`, function (done) {
        let called = false;
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        new MiddlewareSet()
            .use(() => {
                return Promise.resolve();
            })
            .use((context, next) => {
                called = true;
                return next();
            })
            .run(context, () => {
                assert(false, `bot logic not intercepted.`);
            })
            .then(() => {
                assert(!called, `other middleware not intercepted.`);
                done();
            });
    });

    it(`should map an exception within middleware to a rejection.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        new MiddlewareSet()
            .use(() => {
                throw new Error('failed');
            })
            .run(context, () => {
                assert(false, `bot logic shouldn't run.`);
            })
            .then(() => {
                assert(false, `exception swallowed.`);
            })
            .catch((err) => {
                assert(err, `invalid exception object.`);
                done();
            });
    });
    
    it(`should throw an error if an invalid plugin type is added.`, function (done) {
        try {
            new MiddlewareSet().use('bogus');
        } catch (err) {
            done();
        }
    });

    it(`should support passing middleware into the constructor of the set.`, function (done) {
        let called = false;
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        new MiddlewareSet((context, next) => {
            called = true;
            return next();
        })
        .run(context, () => { })
        .then(() => {
            assert(called, `middleware not called.`);
            done();
        });
    });
});