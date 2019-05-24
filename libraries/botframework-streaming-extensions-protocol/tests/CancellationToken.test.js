const  chai  = require('chai');
const { CancellationTokenSource, CancellationToken }  = require('../lib/CancellationToken');
var expect = chai.expect;

describe('CancellationToken', () => {
    it('Is not cancelled when created.', () => {
        let ct = new CancellationToken();

        expect(ct)
            .instanceOf(CancellationToken);

        expect(ct.isCancelled())
            .to
            .be
            .false;

    });

    it('throws if cancelled.', () => {
        let ct = new CancellationToken();
        ct.cancel();

        expect(() => ct.throwIfCancelled())
            .to
            .throw('cancelled');
    });

    it('can be cancelled', () => {
        let ct = new CancellationToken();

        expect(ct.isCancelled())
            .to
            .be
            .false;

        ct.cancel();

        expect(ct.isCancelled())
            .to
            .be
            .true;
    });
});

describe('CancellationTokenSource', () => {
    it('creates a new instance', () => {
        let cts = new CancellationTokenSource.CancellationTokenSource();

        expect(cts)
            .instanceOf(CancellationTokenSource);

        expect(cts.token)
            .instanceOf(CancellationToken);
    });

    it('cancels the token', () => {
        let cts = new CancellationToken.CancellationTokenSource();
        let cancelled = cts.token.isCancelled();
        expect(cancelled)
            .equal(false);

        cts.cancel();

        expect(cts.token.isCancelled())
            .to
            .be
            .true;
    });
});
