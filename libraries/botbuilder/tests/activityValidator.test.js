const assert = require('assert');
const { validateActivity } = require('../lib/activityValidator');

describe(`activityValidator`, function() {
    this.timeout(5000);

    it(`should parse negative TimezoneOffset from localTimestamp into localTimezoneOffset.`, () => {
        const activity = validateActivity({ type: 'message', localTimestamp: '2020-03-17T14:42:39.3692591-07:00' });
        assert.strictEqual(activity.localTimezoneOffset, `-07:00`);
    });

    it(`should parse positive TimezoneOffset from localTimestamp into localTimezoneOffset.`, () => {
        const activity = validateActivity({ type: 'message', localTimestamp: '2020-03-17T14:42:39.3692591+07:00' });
        assert.strictEqual(activity.localTimezoneOffset, `+07:00`);
    });

    it(`should not fail when missing TimezoneOffset from localTimestamp.`, () => {
        const activity = validateActivity({ type: 'message', localTimestamp: '2020-03-17T14:42:39.3692591' });
        assert.strictEqual(typeof(activity.localTimezoneOffset), 'undefined');
    });

    it(`should not fail when missing time from localTimestamp.`, () => {
        const activity = validateActivity({ type: 'message', localTimestamp: '2020-03-17' });
        assert.strictEqual(typeof(activity.localTimezoneOffset), 'undefined');
    });
});
