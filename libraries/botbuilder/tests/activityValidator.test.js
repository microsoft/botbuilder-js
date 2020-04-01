const assert = require('assert');
const { validateActivity } = require('../lib/activityValidator');

describe(`activityValidator`, function() {
    this.timeout(5000);

    const timestamp = '2020-03-17T14:42:39.3692591-07:00';

    it(`should preserve original localTimestamp in rawLocalTimestamp.`, () => {
        const activity = validateActivity({ type: 'message', localTimestamp: timestamp });
        assert.strictEqual(activity.rawLocalTimestamp, timestamp);
    });

    it(`should preserve original expiration in rawExpiration.`, () => {
        const activity = validateActivity({ type: 'message', expiration: timestamp });
        assert.strictEqual(activity.rawExpiration, timestamp);
    });

    it(`should preserve original timestamp in rawTimestamp.`, () => {
        const activity = validateActivity({ type: 'message', timestamp: timestamp });
        assert.strictEqual(activity.rawTimestamp, timestamp);
    });

    it(`should not fail when missing localTimestamp.`, () => {
        const activity = validateActivity({ type: 'message' });
        assert.strictEqual(typeof(activity.rawLocalTimestamp), 'undefined');
    });

    it(`should not fail when missing expiration.`, () => {
        const activity = validateActivity({ type: 'message' });
        assert.strictEqual(typeof(activity.rawExpiration), 'undefined');
    });

    it(`should not fail when missing timestamp.`, () => {
        const activity = validateActivity({ type: 'message' });
        assert.strictEqual(typeof(activity.rawTimestamp), 'undefined');
    });
});
