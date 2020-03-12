const { strictEqual } = require('assert');
const { runDialog } = require('../');

describe('runDialog()', function() {
    this.timeout(300);

    describe('parameter validation', () => {
        it('should throw if missing dialog parameter', (done) => {
            runDialog().then(
                () => done(new Error('should have throw error')),
                (err) => {
                    done(strictEqual(err.message, 'runDialog(): missing dialog'));
                });
        });

        it('should throw if missing context parameter', (done) => {
            runDialog({}).then(
                () => done(new Error('should have throw error')),
                (err) => {
                    done(strictEqual(err.message, 'runDialog(): missing context'));
                });
        });

        it('should throw if missing context.activity', (done) => {
            runDialog({}, {}).then(
                () => done(new Error('should have throw error')),
                (err) => {
                    done(strictEqual(err.message, 'runDialog(): missing context.activity'));
                });
        });

        it('should throw if missing accessor parameter', (done) => {
            runDialog({}, { activity: {} }).then(
                () => done(new Error('should have throw error')),
                (err) => {
                    done(strictEqual(err.message, 'runDialog(): missing accessor'));
                });
        });
    });
});
