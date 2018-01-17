const assert = require('assert');
const builder = require('../');

describe('ConsoleAdapter', function() {
    this.timeout(5000);
    it('should process a console adapter message.', function (done) { 
        const adapter = new builder.ConsoleAdapter();
        adapter.onReceive = (activity) => {
            assert(activity);
            adapter.post([{ text: `You said: ${activity.text}` }]);
            return new Promise((resolve, reject) => {
                resolve({ handled: true });
                done();
            });
        }
        adapter.receive(`test`);
    });
});