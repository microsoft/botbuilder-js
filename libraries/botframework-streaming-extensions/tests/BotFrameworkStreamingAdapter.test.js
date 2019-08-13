const Adapter = require('../lib/Integration/BotFrameworkStreamingAdapter');
const ActivityHandler = require("botbuilder-core");
const  chai  = require('chai');
var expect = chai.expect;

class FauxSock{    
    constructor(contentString){
        if(contentString){
            this.contentString = contentString;
            this.position = 0;
        }
        this.connected = true;
    }
    isConnected(){ return this.connected; }
    write(buffer){ return ; }
    connect(serverAddress){ return new Promise(); }
    close(){ this.connected = false; return; }
    setOnMessageHandler(handler){ return; } //(x: any) => void);
    setOnErrorHandler(handler){ return; }
    setOnCloseHandler(handler){ return; }
}

class TestRequest {
    constructor(){
    }

    isUpgradeRequest(){
        return this.upgradeRequestVal;
    }

    setIsUpgradeRequest(value){
        this.upgradeRequestVal = value;
    }

    status(){
        return this.statusVal;
    }

    status(value){
        this.statusVal = value;
    }

    path(value){
        this.pathVal = value;
    }

    path(){
        return this.pathVal;
    }

    verb(value){
        this.verbVal = value;
    }
    
    verb(){
        return this.verbVal;
    }

    streams(value){
        this.streamsVal = value;
    }

    streams(){
        return this.streamsVal;
    }

    headers(){
        return this.headersVal;
    }

    headers(value){
        this.headersVal = value;
    }
}

class TestResponse {

    construtor(){
    }

    send(value){
        this.sendVal = value;
        return this.sendVal;
    }

    status(value){
        this.statusVal = value;
        return this.statusVal;
    }

    claimUpgrade(value)
    {
        this.claimUpgradeVal = value;
    }
    get claimUpgrade(){
        return this.claimUpgradeVal;
    }
}

class TestAdapterSettings {
    constructor(appId = undefined, appPassword = undefined, channelAuthTenant, oAuthEndpoint, openIdMetadata, channelServce){
        this.appId = appId;
        this.appPassword = appPassword;
    }
}

describe('BotFrameworkStreamingAdapter tests', () => {

    it('has the correct status codes', () => {
        expect(Adapter.StatusCodes.OK).to.equal(200);
        expect(Adapter.StatusCodes.BAD_REQUEST).to.equal(400);
        expect(Adapter.StatusCodes.UNAUTHORIZED).to.equal(401);
        expect(Adapter.StatusCodes.NOT_FOUND).to.equal(404);
        expect(Adapter.StatusCodes.METHOD_NOT_ALLOWED).to.equal(405);
        expect(Adapter.StatusCodes.UPGRADE_REQUIRED).to.equal(426);
        expect(Adapter.StatusCodes.INTERNAL_SERVER_ERROR).to.equal(500);
        expect(Adapter.StatusCodes.NOT_IMPLEMENTED).to.equal(501);        
    });

    it('gets constructed properly', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);

        expect(handler).to.be.instanceOf(Adapter.BotFrameworkStreamingAdapter);
        expect(handler.bot).to.equal(bot);
        expect(handler.logger).to.equal(console);
        expect(handler.middleWare).to.be.an('array').that.is.empty;
    });

    it('starts and stops a namedpipe server', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);

        handler.connectNamedPipe('PipeyMcPipeface');
        expect(handler.server.disconnect()).to.not.throw;
    });

    it('starts and stops a websocket server', (done) => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);
        let request = new TestRequest();
        let response = new TestResponse({claimUpgrade:'anything'});
        let settings = new TestAdapterSettings(undefined, undefined);

        expect(handler.connectWebSocket(request, response, settings)).to.not.throw;
        done();
    });

    it('returns a connector client', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        cc = handler.createConnectorClient('www.contoso.com');
        expect(cc.baseUri).to.equal('www.contoso.com');
    });

    it('connectWebSocket returns an error when request is not an upgrade request', () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);
        let request = new TestRequest();
        request.setIsUpgradeRequest(false);
        let response = new TestResponse();
        let settings = new TestAdapterSettings(undefined, undefined);        

        handler.connectWebSocket(request, response, settings).catch();
        expect(response.sendVal).to.equal('Upgrade to WebSockets required.');
        expect(response.statusVal).to.equal(426);       
    });

    it('connectWebSocket returns status code 401 when request is not authorized', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);
        let request = new TestRequest();
        request.setIsUpgradeRequest(true);
        request.headers({channelid: 'fakechannel', authorization: 'donttrustme'});
        let response = new TestResponse();
        let settings = new TestAdapterSettings('appId', 'password');    

        await handler.connectWebSocket(request, response, settings).then(function(){
            return;
        });     
        expect(response.sendVal).to.equal(undefined);
        expect(response.statusVal).to.equal(401); 
    });


    // it('returns a 500 when the request body is missing', async () => {
    //     let bot = new ActivityHandler.ActivityHandler();
    //     let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
    //     let request = new TestRequest( 'POST', '/api/messages');

    //   await handler.processRequest(request).then( 
    //             function(response) {
    //                 expect(response.statusCode).to.equal(500);                    
    //             });        
    // });

    it('returns a 500 when the request is missing streams', () => {

    });

    it('returns a 500 when the request is missing', () => {

    });

    it('returns a 500 when the request verb is missing', () => {

    });

    it('returns a 500 when the request path is missing', () => {

    });

    it('returns user agent information when a GET hits the version endpoint', () => {

    });

    it('returns a 405 when the verb is not POST and the path is not version', () => {

    });

    it('returns a 404 when the verb is POST but the path is not version or messages', () => {

    });

    it('processes a well formed request when there is no middleware', () => {

    });

    it('processes a well formed request when there is middleware', () => {

    });

    it('processes a well formed request when the activity type is Invoke', () => {

    });
});