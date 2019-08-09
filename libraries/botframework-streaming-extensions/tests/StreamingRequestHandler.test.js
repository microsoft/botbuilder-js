const SRH = require('../lib/Integration/StreamingRequestHandler');
const ActivityHandler = require("botbuilder-core");
const  chai  = require('chai');
var expect = chai.expect;

describe('StreamingRequestHandler tests', () => {

    it('has the correct status codes', () => {
        expect(SRH.StatusCodes.OK).to.equal(200);
        expect(SRH.StatusCodes.BAD_REQUEST).to.equal(400);
        expect(SRH.StatusCodes.UNAUTHORIZED).to.equal(401);
        expect(SRH.StatusCodes.NOT_FOUND).to.equal(404);
        expect(SRH.StatusCodes.METHOD_NOT_ALLOWED).to.equal(405);
        expect(SRH.StatusCodes.UPGRADE_REQUIRED).to.equal(426);
        expect(SRH.StatusCodes.INTERNAL_SERVER_ERROR).to.equal(500);
        expect(SRH.StatusCodes.NOT_IMPLEMENTED).to.equal(501);        
    });

    it('gets constructed properly', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new SRH.StreamingRequestHandler(bot);

        expect(handler).to.be.instanceOf(SRH.StreamingRequestHandler);
        expect(handler.bot).to.equal(bot);
        expect(handler.logger).to.equal(console);
        expect(handler.middleWare).to.be.an('array').that.is.empty;
    });

    it('starts and stops a namedpipe server', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new SRH.StreamingRequestHandler(bot);

        handler.startNamedPipe('PipeyMcPipeface');
        expect(handler.server.disconnect()).to.not.throw;
    });

    it('returns a connector client', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new SRH.StreamingRequestHandler(bot); 
        cc = handler.createConnectorClient('www.contoso.com');
        expect(cc.baseUri).to.equal('www.contoso.com');
    });
});