const assert = require('assert');
const { BotAdapter, MiddlewareSet, TurnContext } = require('../');

class SimpleAdapter extends BotAdapter {}

const testMessage = { text: 'test', type: 'message' };

const context = new TurnContext(new SimpleAdapter(), testMessage);

const noop = () => {
    // no-op
};

describe(`MiddlewareSet`, () => {
    // Generates middleware helper that itself generates middleware that pushes a value
    // on a stack. Returns the middleware generator function, the stack, and a clean
    // MiddlewareSet instance for testing
    const stackMiddleware = () => {
        const stack = [];

        return {
            middleware: (value) => (_, next) => {
                stack.unshift(value);
                return next();
            },
            set: new MiddlewareSet(),
            stack,
        };
    };

    it(`should use() middleware individually.`, () => {
        const { middleware, set } = stackMiddleware();
        set.use(middleware('a')).use(middleware('b'));
    });

    it(`should use() a list of middleware.`, () => {
        const { middleware, set } = stackMiddleware();
        set.use(middleware('a'), middleware('b'), middleware('c'));
    });

    it(`should run all middleware in order.`, (done) => {
        const { middleware, set, stack } = stackMiddleware();
        set.use(middleware(1), middleware(2), middleware(3));

        set.run(context, () => {
            assert.deepStrictEqual(stack, [3, 2, 1], 'stack holds expected values');
        })
            .then(done)
            .catch(done);
    });

    it(`should run a middleware set added to another middleware set.`, (done) => {
        const { middleware, set: child, stack } = stackMiddleware();

        child.use(middleware(1));
        const parent = new MiddlewareSet(child);

        parent
            .run(context, () => {
                assert.deepStrictEqual(stack, [1]);
            })
            .then(done)
            .catch(done);
    });

    it(`should run middleware with a leading and trailing edge.`, async () => {
        const { set, stack } = stackMiddleware();

        set.use(async (_, next) => {
            stack.unshift(1);

            await next();

            stack.unshift(2);
        });

        await set.run(context, () => {
            stack.unshift(3);
        });

        assert.deepStrictEqual(stack, [2, 3, 1]);
    });

    it(`should support middleware added as an object.`, (done) => {
        const { middleware, set, stack } = stackMiddleware();

        set.use({ onTurn: middleware(1) }).use({ onTurn: middleware(2) });

        set.run(context, () => {
            assert.deepStrictEqual(stack, [2, 1]);
        })
            .then(done)
            .catch(done);
    });

    it(`not calling next() should intercept other middleware and bot logic.`, (done) => {
        const { middleware, set, stack } = stackMiddleware();

        set.use(middleware(1), noop, middleware(2));

        set.run(context, () => {
            assert.deepStrictEqual(stack, [1]);
        })
            .then(done)
            .catch(done);
    });

    it(`should map an exception within middleware to a rejection.`, function (done) {
        const { middleware, set, stack } = stackMiddleware();

        set.use(middleware(1), () => Promise.reject(new Error('rejected')), middleware(2));

        set.run(context, noop)
            .then(() => done(new Error('expected error')))
            .catch(() => {
                try {
                    assert.deepStrictEqual(stack, [1]);
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it(`should throw an error if an invalid plugin type is added.`, () => {
        assert.throws(() => new MiddlewareSet().use('bogus'));
    });

    it(`should support passing middleware into the constructor of the set.`, (done) => {
        const { middleware, stack } = stackMiddleware();

        new MiddlewareSet(middleware(1), middleware(2), middleware(3))
            .run(context, () => {
                assert.deepStrictEqual(stack, [3, 2, 1]);
            })
            .then(done)
            .catch(done);
    });

    it('should unroll middleware even if some later middleware rejects', (done) => {
        const { middleware, set, stack } = stackMiddleware();

        set.use(
            middleware(1),
            async (_, next) => {
                try {
                    stack.unshift(2);
                    await next();
                } finally {
                    stack.shift();
                }
            },
            () => Promise.reject(new Error('rejected')),
            middleware(4)
        );

        set.run(context, noop)
            .then(() => done(new Error('expected error')))
            .catch((err) => {
                try {
                    assert.strictEqual(err.message, 'rejected');
                    assert.deepStrictEqual(stack, [1]);
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });

    it('should unroll middleware even if the next handler reject', (done) => {
        const { middleware, set, stack } = stackMiddleware();

        set.use(middleware(1), async (_, next) => {
            try {
                stack.unshift(2);
                await next();
            } finally {
                stack.shift();
            }
        });

        set.run(context, () => Promise.reject(new Error('rejected')))
            .then(() => done(new Error('expected error')))
            .catch((err) => {
                try {
                    assert.strictEqual(err.message, 'rejected');
                    assert.deepStrictEqual(stack, [1]);
                    done();
                } catch (err) {
                    done(err);
                }
            });
    });
});
