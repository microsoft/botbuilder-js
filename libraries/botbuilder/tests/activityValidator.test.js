const assert = require('assert');
const { validateAndFixActivity } = require('../lib/activityValidator');

describe(`activityValidator`, function() {
    this.timeout(5000);

    const timestamp = '2020-03-17T14:42:39.3692591-07:00';

    it(`should preserve original localTimestamp in rawLocalTimestamp.`, () => {
        const activity = validateAndFixActivity({ type: 'message', localTimestamp: timestamp });
        assert.strictEqual(activity.rawLocalTimestamp, timestamp);
    });

    it(`should preserve original expiration in rawExpiration.`, () => {
        const activity = validateAndFixActivity({ type: 'message', expiration: timestamp });
        assert.strictEqual(activity.rawExpiration, timestamp);
    });

    it(`should preserve original timestamp in rawTimestamp.`, () => {
        const activity = validateAndFixActivity({ type: 'message', timestamp: timestamp });
        assert.strictEqual(activity.rawTimestamp, timestamp);
    });

    it(`should not fail when missing localTimestamp.`, () => {
        const activity = validateAndFixActivity({ type: 'message' });
        assert.strictEqual(typeof(activity.rawLocalTimestamp), 'undefined');
    });

    it(`should not fail when missing expiration.`, () => {
        const activity = validateAndFixActivity({ type: 'message' });
        assert.strictEqual(typeof(activity.rawExpiration), 'undefined');
    });

    it(`should not fail when missing timestamp.`, () => {
        const activity = validateAndFixActivity({ type: 'message' });
        assert.strictEqual(typeof(activity.rawTimestamp), 'undefined');
    });

    it(`should convert timestamp string to Date.`, () => {
        const activity = validateAndFixActivity({ type: 'message', timestamp: timestamp });
        assert.equal(activity.timestamp.valueOf(), new Date(timestamp).valueOf());
    });

    it(`should convert localTimestamp string to Date.`, () => {
        const activity = validateAndFixActivity({ type: 'message', localTimestamp: timestamp });
        assert.equal(activity.localTimestamp.valueOf(), new Date(timestamp).valueOf());
    });

    it(`should convert expiration string to Date.`, () => {
        const activity = validateAndFixActivity({ type: 'message', expiration: timestamp });
        assert.equal(activity.expiration.valueOf(), new Date(timestamp).valueOf());
    });
});
