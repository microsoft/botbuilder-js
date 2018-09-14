const assert = require('assert');
const { BotAdapter, TurnContext } = require('../');

const testMessage = { text: 'test', type: 'message' };

class SimpleAdapter extends BotAdapter {
    processRequest(activity, handler) {
        const context = new TurnContext(this, activity);
        return this.runMiddleware(context, handler);
    }

}


describe(`BotAdapter`, function () {
    this.timeout(5000);

    let calls = 0;
    function middleware(context, next) {
        assert(context, `middleware[${calls}]: context object missing.`);
        assert(next, `middleware[${calls}]: next() function missing.`);
        calls++;
        return next();
    }

    const adapter = new SimpleAdapter();
    
    it(`should use() middleware individually.`, function (done) {
        adapter.use(middleware).use(middleware);
        done();
    });

    it(`should use() a list of middleware.`, function (done) {
        adapter.use(middleware, middleware, middleware);
        done();
    });

    it(`should run all middleware.`, function (done) {
        adapter.processRequest(testMessage, (context) => {
            assert(context, `callback not passed context object.`);
            assert(calls === 5, `only "${calls} of 5" middleware called.`);
        }).then(() => done());
    });
   
    it(`should reach onTurnError when error is thrown.`, function (done) {
        adapter.onTurnError = async (turnContext, error) => {
            assert(turnContext, `turnContext not found.`);
            assert(error, `error not found.`);
            assert.equal(error, 1, `unexpected error thrown.`);
            done();
        }

        adapter.processRequest(testMessage, (turnContext) => {
            throw 1;
        });
    });
});