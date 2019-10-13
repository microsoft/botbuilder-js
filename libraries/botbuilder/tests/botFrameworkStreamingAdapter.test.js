const Adapter = require('../lib/botFrameworkStreamingAdapter');
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
        let headers = [];
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

    setHeaders(){
        return this.headersVal;
    }

    setHeaders(value){
        this.headers = value;
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

    setClaimUpgrade(value)
    {
        this.claimUpgradeVal = value;
    }

    claimUpgrade(){
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
        request.setHeaders({channelid: 'fakechannel', authorization: 'donttrustme'});
        let response = new TestResponse();
        let settings = new TestAdapterSettings('appId', 'password');    

        await handler.connectWebSocket(request, response, settings).then(function(){
            return;
        });     
        expect(response.sendVal).to.equal(undefined);
        expect(response.statusVal).to.equal(401); 
    });

    it('connectWebSocket connects', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);
        let request = new TestRequest();        
        request.setIsUpgradeRequest(true);       
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        let response = new TestResponse();
        let fakeSocket = { 
            unshift: function(){return true;},
            write: function(value){console.log(value);},
            on: function(value){console.log(value);},
            read: function(){return new Buffer('data', 'utf8');},
            end: function(){return;},
        };
        response.setClaimUpgrade( {socket: fakeSocket, head: 'websocket'} );
        let settings = new TestAdapterSettings();    

        await handler.connectWebSocket(request, response, settings).then(function(){
            return;
        });     
    });

    it('returns a 400 when the request is missing verb', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = undefined;
        request.path = '/api/messages';
        let fakeStream = {
            readAsJson: function(){ return {type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(400);                    
            });  
    });

    it('returns a 400 when the request is missing path', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'POST';
        request.path =  undefined;
        let fakeStream = {
            readAsJson: function(){ return {type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(400);                    
            });  
    });

    it('returns a 400 when the request body is missing', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest( 'POST', '/api/messages');
        request.verb = 'POST';
        request.path = '/api/messages';
        request.streams = undefined;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(400);                    
            });        
    });

    it('returns user agent information when a GET hits the version endpoint', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'GET';
        request.path = '/api/version';
        let fakeStream = {
            readAsJson: function(){ return {type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(200); 
                expect(response.streams[0].content).to.not.be.undefined;                   
            });     
    });

    it('returns user agent information from cache when a GET hits the version endpoint more than once', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'GET';
        request.path = '/api/version';
        let fakeStream = {
            readAsJson: function(){ return {type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(200); 
                expect(response.streams[0].content).to.not.be.undefined;                   
            });     

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(200); 
                expect(response.streams[0].content).to.not.be.undefined;                   
            }); 
    });

    it('returns 405 for unsupported methods', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'UPDATE';
        request.path = '/api/version';
        let fakeStream = {
            readAsJson: function(){ return {type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(405);              
            });     
    });

    it('returns 404 for unsupported paths', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'POST';
        request.path = '/api/supersecretbackdoor';
        let fakeStream = {
            readAsJson: function(){ return {type: 'Invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(404);              
            });     
    });

    it('processes a well formed request when there is no middleware with a non-Invoke activity type', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'POST';
        request.path = '/api/messages';
        let fakeStream = {
            readAsJson: function(){ return {type: 'something', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(200);              
            });     
    });

    it('returns a 501 when activity type is invoke, but the activity is invalid', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot); 
        let request = new TestRequest();
        request.verb = 'POST';
        request.path = '/api/messages';
        let fakeStream = {
            readAsJson: function(){ return {type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(501);              
            });     
    });

    it('sends a request', async () => {
        let bot = new ActivityHandler.ActivityHandler();
        let handler = new Adapter.BotFrameworkStreamingAdapter(bot);
        let request = new TestRequest();        
        request.setIsUpgradeRequest(true);       
        request.headers = [];
        request.headers['upgrade'] = 'websocket';
        request.headers['sec-websocket-key'] = 'BFlat';
        request.headers['sec-websocket-version'] = '13';
        request.headers['sec-websocket-protocol'] = '';
        let response = new TestResponse();
        let fakeSocket = {
            unshift: function(){return true;},
            write: function(){return Promise.resolve; },
            on: function(){return;},
            read: function(){return new Buffer('data', 'utf8');},
            end: function(){return Promise.resolve;},
        };
        var sinon = require('sinon');
        var spy = sinon.spy(fakeSocket, "write");
        response.setClaimUpgrade( {socket: fakeSocket, head: 'websocket'} );
        let settings = new TestAdapterSettings();    

        await handler.connectWebSocket(request, response, settings).then(function(){
            return;
        });
        
        let connection = handler.createConnectorClient('fakeUrl');
        connection.sendRequest({method: 'POST', url: 'testResultDotCom', body: 'Test body!'});
        expect(spy.called).to.be.true;
    }).timeout(2000);

    it('returns a 500 when bot can not run', async () => {
        const MiddleWare = require('botbuilder-core');
        let bot = {};
        let mw = { 
            async onTurn(context, next) 
            {
                console.log('Middleware executed!');
                await next();
            }};
        let mwset = [];
        mwset.push(mw);
        let handler = new Adapter.BotFrameworkStreamingAdapter({ bot: bot, middleWare: mwset}); 
        let request = new TestRequest();
        request.verb = 'POST';
        request.path = '/api/messages';
        let fakeStream = {
            readAsJson: function(){ return {type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(500);              
            });     
    });

    it('executes middleware', async () => {
        var sinon = require('sinon');
        let bot= new ActivityHandler.ActivityHandler();
        bot.run = function(turnContext){return Promise.resolve();};
        let mw = { 
            async onTurn(context, next) 
            {
                console.log('Middleware executed!');
                await next();
            }};
        
        let mwset = [];
        mwset.push(mw);
        let handler = new Adapter.BotFrameworkStreamingAdapter({bot: bot, middleWare: mwset}); 
        handler.bot.run = function(turnContext){return Promise.resolve();};
        var spy = sinon.spy(handler.bot, "run");
        let request = new TestRequest();
        request.verb = 'POST';
        request.path = '/api/messages';
        let fakeStream = {
            readAsJson: function(){ return {type: 'invoke', serviceUrl: 'somewhere/', channelId: 'test'};},
        };
        request.streams[0] = fakeStream;

        await handler.processRequest(request).then( 
            function(response) {
                expect(response.statusCode).to.equal(501);    
                expect(spy.called).to.be.true;          
            });     
    });
});