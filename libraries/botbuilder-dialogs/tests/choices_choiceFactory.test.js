const assert = require('assert');
const { ChoiceFactory } = require('../');

function assertActivity(received, expected) {
    assert(received, `Activity not returned.`);
    for (let key in expected) {
        const v = received[key];
        assert(v !== undefined, `Activity.${key} missing.`);
        const ev = expected[key];
        assert(typeof v === typeof ev, `Activity.${key} has invalid type of '${typeof v}'.`);
        if (Array.isArray(ev)) {
            assert(v.length === ev.length, `Activity.${key} has invalid length of '${v.length}'.`);
            assert(JSON.stringify(v) === JSON.stringify(ev), `Activity.${key} has invalid contents: ` + JSON.stringify(v));
        } else if (typeof ev === 'object') {
            assert(JSON.stringify(v) === JSON.stringify(ev), `Activity.${key} has invalid contents: ` + JSON.stringify(v));
        } else {
            assert(v === ev, `Activity.${key} has invalid value of '${v}'.`);
        }
    }
}

const colorChoices = ['red', 'green', 'blue'];

describe('ChoiceFactory', function() {
    this.timeout(5000);
   
    it('should render choices inline.', function (done) {
        const activity = ChoiceFactory.inline(colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from: (1) red, (2) green, or (3) blue`
        });
        done();
    });

    it('should render choices as a list.', function (done) {
        const activity = ChoiceFactory.list(colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from:\n\n   1. red\n   2. green\n   3. blue`
        });
        done();
    });

    it('should render choices as suggested actions.', function (done) {
        const activity = ChoiceFactory.suggestedAction(colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from:`,
            suggestedActions: {
                actions: [
                    { type: 'imBack', value: 'red', title: 'red' },
                    { type: 'imBack', value: 'green', title: 'green' },
                    { type: 'imBack', value: 'blue', title: 'blue' }
                ]
            }
        });
        done();
    });

    it('should automatically choose render style based on channel type.', function (done) {
        const activity = ChoiceFactory.forChannel('emulator', colorChoices, 'select from:');
        assertActivity(activity, {
            text: `select from:`,
            suggestedActions: {
                actions: [
                    { type: 'imBack', value: 'red', title: 'red' },
                    { type: 'imBack', value: 'green', title: 'green' },
                    { type: 'imBack', value: 'blue', title: 'blue' }
                ]
            }
        });
        done();
    });
});
