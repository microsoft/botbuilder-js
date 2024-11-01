const { SubscribableStream } = require('..');
const { PayloadReceiver, PayloadSender } = require('../lib/payloadTransport');
const { PayloadAssemblerManager, PayloadTypes, StreamManager } = require('../lib/payloads');
const importSync= require('import-sync');
const { expect } = importSync('chai/lib/chai');
const sinon = require('sinon');

class FauxSock {
    constructor(contentString) {
        if (contentString) {
            this.contentString = contentString;
            this.position = 0;
        }
    }
    send(buffer) {
        return buffer.length;
    }

    receive(readLength) {
        if (this.contentString[this.position]) {
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if (this.receiver.isConnected) this.receiver.disconnect();
    }
    close() {}

    setReceiver(receiver) {
        this.receiver = receiver;
    }
}
describe('PayloadTransport', function () {
    describe('PayloadSender', function () {
        it('starts out disconnected.', function () {
            const ps = new PayloadSender();
            expect(ps.isConnected).to.equal(false);
        });

        it('connects to its sender.', function () {
            const ps = new PayloadSender();
            ps.connect(new FauxSock());
            expect(ps.isConnected).to.equal(true);
        });

        it('writes to its sender.', function (done) {
            const ps = new PayloadSender();
            ps.connect(new FauxSock());
            expect(ps.isConnected).to.equal(true);

            const stream = new SubscribableStream();
            stream.write('This is a test stream.');
            const header = {
                payloadType: PayloadTypes.request,
                payloadLength: stream.length,
                id: '100',
                end: true,
            };

            const psSenderSpy = sinon.spy(ps._sender, 'send');
            expect(ps.sendPayload(header, stream, () => done()));
            expect(psSenderSpy.calledTwice).to.be.true;
        });

        it('writes a large stream to its sender.', function (done) {
            const ps = new PayloadSender();
            ps.connect(new FauxSock());
            expect(ps.isConnected).to.equal(true);

            const stream = new SubscribableStream();
            let testString = '';
            let count = 250;
            while (count >= 0) {
                testString += 'This is a LARGE test stream.';
                count--;
            }

            stream.write(testString);
            // Max PayloadLength is 4096
            const header = {
                payloadType: PayloadTypes.request,
                payloadLength: stream.length,
                id: '100',
                end: true,
            };
            const psSenderSpy = sinon.spy(ps._sender, 'send');

            expect(
                ps.sendPayload(header, stream, () => {
                    // This try-catch is required as chai/lib/chai failures need to be caught and bubbled up via done().
                    try {
                        expect(psSenderSpy.callCount).to.equal(4);
                        done();
                    } catch (e) {
                        done(e);
                    }
                })
            );
        });

        it('calls the packet sent callback.', function (done) {
            const ps = new PayloadSender();
            ps.connect(new FauxSock());
            expect(ps.isConnected).to.equal(true);

            const stream = new SubscribableStream();
            stream.write('This is a test stream.');
            const header = {
                payloadType: PayloadTypes.request,
                payloadLength: 22,
                id: '100',
                end: true,
            };

            ps.sendPayload(header, stream, () => done());
        });

        it('disconnects when header length is longer than packet length.', function () {
            const ps = new PayloadSender();
            ps.connect(new FauxSock());
            expect(ps.isConnected).to.equal(true);

            const stream = new SubscribableStream();
            stream.write('This is a test stream.');
            const header = {
                payloadType: PayloadTypes.request,
                payloadLength: 42,
                id: '100',
                end: true,
            };

            ps.sendPayload(header, stream);

            expect(ps.isConnected).to.equal(false);
        });

        it('gracefully fails when trying to write before connecting.', function () {
            // When not connected, PayloadSender should not throw.
            // It should drop the packet silently.
            const ps = new PayloadSender();
            expect(ps.isConnected).to.equal(false);

            const stream = new SubscribableStream();
            stream.write('This is a test stream.');
            const header = {
                payloadType: PayloadTypes.request,
                payloadLength: 22,
                id: '100',
                end: true,
            };

            ps.sendPayload(header, stream);
        });
    });

    describe('PayloadReceiver', function () {
        it('begins disconnected.', function () {
            const pr = new PayloadReceiver();
            expect(pr.isConnected).to.be.false;
        });

        it('connects to and reads a header with no payload from the transport.', function () {
            const pr = new PayloadReceiver();

            const sock = new FauxSock(['A.000000.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n']);
            sock.setReceiver(pr);

            pr.connect(sock);
            expect(pr.isConnected).to.be.true;
        });

        it('connects to and reads a header with a stream the transport.', function (done) {
            const pr = new PayloadReceiver();

            const sock = new FauxSock(['S.000005.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n', '12345']);
            sock.setReceiver(pr);

            this.streamManager = new StreamManager(undefined);
            const assemblerManager = new PayloadAssemblerManager(this.streamManager);

            pr.subscribe(
                (header) => assemblerManager.getPayloadStream(header),
                (header, contentStream, contentLength) =>
                    assemblerManager.onReceive(header, contentStream, contentLength)
            );

            expect(() => pr.connect(sock)).to.not.throw();

            pr.disconnected = () => done();
            expect(pr.isConnected).to.be.true;
        });
    });
});
