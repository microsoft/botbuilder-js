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

    it(`should run all middleware in order.`, async function () {
        const { middleware, set, stack } = stackMiddleware();
        set.use(middleware(1), middleware(2), middleware(3));

        await set.run(context, () => {
            assert.deepStrictEqual(stack, [3, 2, 1], 'stack holds expected values');
        });
    });

    it(`should run a middleware set added to another middleware set.`, async function () {
        const { middleware, set: child, stack } = stackMiddleware();

        child.use(middleware(1));
        const parent = new MiddlewareSet(child);

        await parent.run(context, () => {
            assert.deepStrictEqual(stack, [1]);
        });
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

    it(`should support middleware added as an object.`, async function () {
        const { middleware, set, stack } = stackMiddleware();

        set.use({ onTurn: middleware(1) }).use({ onTurn: middleware(2) });

        await set.run(context, () => {
            assert.deepStrictEqual(stack, [2, 1]);
        });
    });

    it(`not calling next() should intercept other middleware and bot logic.`, async function () {
        const { middleware, set, stack } = stackMiddleware();

        set.use(middleware(1), noop, middleware(2));

        await set.run(context, () => {
            assert.deepStrictEqual(stack, [1]);
        });
    });

    it(`should map an exception within middleware to a rejection.`, async function () {
        const { middleware, set, stack } = stackMiddleware();

        set.use(middleware(1), () => Promise.reject(new Error('rejected')), middleware(2));

        try {
            await set.run(context, noop);
            assert.fail('Expected error');
        } catch (err) {
            assert.strictEqual(err.message, 'rejected');
            assert.deepStrictEqual(stack, [1]);
        }
    });

    it(`should throw an error if an invalid plugin type is added.`, () => {
        assert.throws(() => new MiddlewareSet().use('bogus'));
    });

    it(`should support passing middleware into the constructor of the set.`, async function () {
        const { middleware, stack } = stackMiddleware();

        const set = new MiddlewareSet(middleware(1), middleware(2), middleware(3));
        await set.run(context, () => {
            assert.deepStrictEqual(stack, [3, 2, 1]);
        });
    });

    it('should unroll middleware even if some later middleware rejects', async function () {
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

        try {
            await set.run(context, noop);
            assert.fail('Expected error');
        } catch (err) {
            assert.strictEqual(err.message, 'rejected');
            assert.deepStrictEqual(stack, [1]);
        }
    });

    it('should unroll middleware even if the next handler reject', async function () {
        const { middleware, set, stack } = stackMiddleware();

        set.use(middleware(1), async (_, next) => {
            try {
                stack.unshift(2);
                await next();
            } finally {
                stack.shift();
            }
        });

        try {
            await set.run(context, () => Promise.reject(new Error('rejected')));
            assert.fail('Expected error');
        } catch (err) {
            assert.strictEqual(err.message, 'rejected');
            assert.deepStrictEqual(stack, [1]);
        }
    });
});
