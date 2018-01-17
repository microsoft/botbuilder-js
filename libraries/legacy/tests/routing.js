var assert = require('assert');
var builder = require('../');

/*
describe('routing', function() {
    this.timeout(5000);
    it('should recognize an intent', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.recognizer(new builder.RegExpRecognizer('test', /^test/i));
        bot.onFindRoutes(function (context, callback) {
            assert(context !== null && callback !== null);
            assert(context.intent !== null);
            assert(context.intent.score === 1.0);
            assert(context.intent.intent === 'test');
            done();
        });
        connector.processMessage('test');
    });

    it('should route to the default dialog', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) { 
            assert(session !== null);
            assert(args == null);
            done();
        });
        connector.processMessage('test');
    });

    it('should route to a global action', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/test', function (session, args) { 
            assert(session !== null);
            assert(args !== null);
            done();
        }).triggerAction({ matches: /test/i });
        connector.processMessage('test');
    });

    it('should route to a stack action', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            session.send('step1');
        }).cancelAction('cancel', null, {
            matches: /cancel/i,
            onSelectAction: function (session, args, next) {
                assert(session !== null);
                assert(args !== null);
                assert(next !== null);
                done();
            }
        });
        bot.on('send', function (message) {
            connector.processMessage('cancel');
        });
        connector.processMessage('test');
    });

    it('should route to a deep stack action', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            session.beginDialog('/child');
        }).cancelAction('cancel', null, { matches: /cancel/i });
        bot.dialog('/child', function (session) {
            session.send('step1');
        }).cancelAction('cancel', null, {
            matches: /cancel/i,
            onSelectAction: function (session, args, next) {
                done();
            }
        });
        bot.on('send', function (message) {
            connector.processMessage('cancel');
        });
        connector.processMessage('test');
    });

    it('should route to a middle stack action', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            session.beginDialog('/child');
        }).cancelAction('cancel', null, {
            matches: /(cancel order|cancel)/i,
            onSelectAction: function (session, args, next) {
                done();
            }
        });
        bot.dialog('/child', function (session) {
            session.send('step1');
        }).cancelAction('cancel', null, { matches: /(cancel item|cancel)/i });
        bot.on('send', function (message) {
            connector.processMessage('cancel order');
        });
        connector.processMessage('test');
    });

    it('should route over multiple libraries', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var lib = new builder.Library('lib');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session) {
            assert(false);
        });
        lib.dialog('/', function (session) {
            done();
        }).triggerAction({ matches: /test/i });
        connector.processMessage('test');
    });

    it('should favor the root library', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var lib = new builder.Library('lib');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session) {
            done();
        }).triggerAction({ matches: /test/i });
        lib.dialog('/', function (session) {
            assert(false);
        }).triggerAction({ matches: /test/i });
        connector.processMessage('test');
    });

    it('should favor the deepest library', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var lib1 = new builder.Library('lib1');
        var lib2 = new builder.Library('lib2');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib1);
        bot.library(lib2);
        bot.dialog('/', function (session) { session.beginDialog('lib1:/'); });
        bot.dialog('/test', function (session) {
            assert(false);
        }).triggerAction({ matches: /test/i });
        lib1.dialog('/', function (session) { session.beginDialog('lib2:/'); });
        lib1.dialog('/test', function (session) {
            assert(false);
        }).triggerAction({ matches: /test/i });
        lib2.dialog('/', function (session) { session.send('step1'); });
        lib2.dialog('/test', function (session) {
            done();
        }).triggerAction({ matches: /test/i });
        bot.on('send', function (message) {
            connector.processMessage('test');
        });
        connector.processMessage('start');
    });

    it('child libraries should inherit the root intents', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var lib1 = new builder.Library('lib1');
        var bot = new builder.UniversalBot(connector);
        bot.recognizer(new builder.RegExpRecognizer('test', /test/i));
        bot.library(lib1);
        bot.dialog('/', function (session) { assert(false); });
        lib1.dialog('/test', function (session) {
            done();
        }).triggerAction({ matches: 'test' });
        connector.processMessage('test');
    });

    it('should only call the root libraries recognizer once', function (done) { 
        var cnt = 0;
        var connector = new builder.ConsoleConnector();       
        var lib1 = new builder.Library('lib1');
        var bot = new builder.UniversalBot(connector);
        bot.recognizer({
            recognize: function (context, callback) {
                assert(++cnt === 1);
                assert(context != null);
                callback(null, { score: 1.0, intent: 'test' });
            }
        });
        bot.library(lib1);
        bot.dialog('/', function (session) { assert(false); });
        lib1.dialog('/test', function (session) {
            done();
        }).triggerAction({ matches: 'test' });
        connector.processMessage('test');
    });
});
*/