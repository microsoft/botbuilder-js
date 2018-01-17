var assert = require('assert');
var builder = require('../');

/*
describe('actions', function() {
    this.timeout(5000);
    it('should launch dialog using a triggerAction()', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/test', function (session, args) { 
            assert(session !== null);
            assert(args !== null);
            done();
        }).triggerAction({ matches: /test/i });
        connector.processMessage('test');
    });

    it('should launch dialog using a triggerAction() with a intent', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.recognizer(new builder.RegExpRecognizer('test', /test/i));
        bot.dialog('/test', function (session, args) { 
            done();
        }).triggerAction({ matches: 'test' });
        connector.processMessage('test');
    });

    it('should launch dialog using a triggerAction() with custom onFindAction.', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/test', function (session, args) { 
            done();
        }).triggerAction({ 
            onFindAction: function (context, callback) {
                assert(context !== null);
                assert(callback !== null);
                callback(null, 1.0);
            }
        });
        connector.processMessage('test');
    });

    it('should allow passing of custom data to dialog from onFindAction.', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/test', function (session, args) {
            assert(args && args.data);
            assert(args.data == 'test'); 
            done();
        }).triggerAction({ 
            onFindAction: function (context, callback) {
                callback(null, 1.0, { data: 'test' });
            }
        });
        connector.processMessage('test');
    });

    it('should allow interception of a triggered action using onSelectAction.', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            session.send('Hi');
        }).triggerAction({ 
            matches: /test/i,
            onSelectAction: function (session, args, next) {
                assert(session !== null);
                assert(args !== null);
                assert(args.action === '*:/');
                assert(next !== null);
                done();
            }
        });
        connector.processMessage('test');
    });

    it('should reload the same dialog using a reloadAction().', function (done) { 
        var menuLoaded = false;
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            session.beginDialog('/menu');
        });
        bot.dialog('/menu', function (session, args) {
            builder.Prompts.text(session, "ChooseOption");
        }).reloadAction('showMenu', null, { matches: /show menu/i });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'ChooseOption':
                    if (!menuLoaded) {
                        menuLoaded = true;
                        connector.processMessage("show menu");
                    } else {
                        done();
                    }
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should reload the same dialog using a reloadAction() but pass additional args.', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            session.beginDialog('/menu');
        });
        bot.dialog('/menu', function (session, args) {
            if (args && args.reloaded) {
                builder.Prompts.text(session, "ReloadedChooseOption");
            } else {
                builder.Prompts.text(session, "ChooseOption");
            }
        }).reloadAction('showMenu', null, { 
            matches: /show menu/i,
            dialogArgs: { reloaded: true } 
        });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'ChooseOption':
                    connector.processMessage("show menu");
                    break;
                case 'ReloadedChooseOption':
                    done();
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should load a diffierent dialog using beginDialogAction().', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            builder.Prompts.text(session, "ChooseFood");
        }).beginDialogAction('foodMenu', '/menu', {
            matches: /show menu/i,
            dialogArgs: { title: 'FoodOptions' } 
        });
        bot.dialog('/menu', function (session, args) {
            var title = args && args.title ? args.title : 'NoTitle';
            session.send(title);
        });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'ChooseFood':
                    connector.processMessage("show menu");
                    break;
                case 'FoodOptions':
                    done();
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should end the current conversation using endConversationAction().', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session) {
            builder.Prompts.text(session, "ChooseFood");
        }).endConversationAction('quit', "goodbye", { matches: /goodbye/i });
        bot.on('send', function (message) {
            if (message.text) {
                switch (message.text) {
                    case 'ChooseFood':
                        connector.processMessage("goodbye");
                        break;
                    case 'goodbye':
                        done();
                        break;
                    default:
                        assert(false);
                        break;
                }
            }
        });
        connector.processMessage('test');
    });
});
*/