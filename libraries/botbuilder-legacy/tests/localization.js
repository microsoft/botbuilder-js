var assert = require('assert');
var builder = require('../');

/*
describe('localization', function() {
    this.timeout(5000);
    it('should return localized prompt when found', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            session.send('id1');
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-en1');
            done();
        });
        connector.processMessage('test');
    });

    it('should return passed in text when not found', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            session.send('id0');
        });
        bot.on('send', function (message) {
            assert(message.text === 'id0');
            done();
        });
        connector.processMessage('test');
    });

    it('should return random prompt for arrays', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            session.send('id3');
        });
        bot.on('send', function (message) {
            assert(message.text.indexOf('index-en3-') === 0);
            done();
        });
        connector.processMessage('test');
    });

    it('should return prompt in users preferred local', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            session.preferredLocale('es', function (err) {
                assert(err === null);
                session.send('id1'); 
            });
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-es1');
            done();
        });
        connector.processMessage('test');
    });

    it('should return prompt in bots default local', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, { localizerSettings: { defaultLocale: 'es' } });
        bot.dialog('/', function (session, args) {
            session.send('id1'); 
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-es1');
            done();
        });
        connector.processMessage('test');
    });

    it('should return prompt in sub-local', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, { localizerSettings: { defaultLocale: 'en-US' } });
        bot.dialog('/', function (session, args) {
            session.send('id1'); 
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-en-US1');
            done();
        });
        connector.processMessage('test');
    });

    it('should fallback to bots locale', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, { localizerSettings: { defaultLocale: 'es' } });
        bot.dialog('/', function (session, args) {
            session.preferredLocale('en', function (err) {
                session.send('id5'); 
            });
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-es5');
            done();
        });
        connector.processMessage('test');
    });

    it('should fallback to bots locale for invalid preferredLocale', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, { localizerSettings: { defaultLocale: 'es' } });
        bot.dialog('/', function (session, args) {
            session.preferredLocale('fr', function (err) {
                session.send('id1'); 
            });
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-es1');
            done();
        });
        connector.processMessage('test');
    });

    it('should fallback to "en" for missing bot locale', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector, { localizerSettings: { defaultLocale: 'fr' } });
        bot.dialog('/', function (session, args) {
            session.send('id1'); 
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-en1');
            done();
        });
        connector.processMessage('test');
    });

    it('library should return libraries prompt', function (done) { 
        var connector = new builder.ConsoleConnector();
        var lib = new builder.Library('TestLib');       
        lib.localePath('./libLocale/');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session, args) {
            session.beginDialog('TestLib:/');
        });
        lib.dialog('/', function (session) {
            session.send('lib2'); 
        });
        bot.on('send', function (message) {
            assert(message.text === 'lib-en2');
            done();
        });
        connector.processMessage('test');
    });

    it('library should return bots overriden prompt', function (done) { 
        var connector = new builder.ConsoleConnector();
        var lib = new builder.Library('TestLib');       
        lib.localePath('./libLocale/');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session, args) {
            session.beginDialog('TestLib:/');
        });
        lib.dialog('/', function (session) {
            session.send('lib1'); 
        });
        bot.on('send', function (message) {
            assert(message.text === 'bot-en1');
            done();
        });
        connector.processMessage('test');
    });

    it('library should return bots prompt for missing locale', function (done) { 
        var connector = new builder.ConsoleConnector();
        var lib = new builder.Library('TestLib');       
        lib.localePath('./libLocale/');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session, args) {
            session.beginDialog('TestLib:/');
        });
        lib.dialog('/', function (session) {
            session.preferredLocale('es', function (err) {
                session.send('lib1'); 
            });
        });
        bot.on('send', function (message) {
            assert(message.text === 'bot-es1');
            done();
        });
        connector.processMessage('test');
    });

    it('should use bots namespace for prompt', function (done) { 
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            builder.Prompts.text(session, 'id1');
        });
        bot.on('send', function (message) {
            assert(message.text === 'index-en1');
            done();
        });
        connector.processMessage('test');
    });

    it('should use bots namespace for retryPrompt', function (done) { 
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            builder.Prompts.number(session, 'id1', { retryPrompt: 'id2' });
        });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'index-en1':
                    connector.processMessage('invalid');
                    break;
                case 'index-en2':
                    done();
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should use libraries namespace for prompt', function (done) { 
        var connector = new builder.ConsoleConnector();
        var lib = new builder.Library('TestLib');       
        lib.localePath('./libLocale/');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session, args) {
            session.beginDialog('TestLib:/');
        });
        lib.dialog('/', function (session) {
            builder.Prompts.text(session, 'lib2');
        });
        bot.on('send', function (message) {
            assert(message.text === 'lib-en2');
            done();
        });
        connector.processMessage('test');
    });

    it('should use libraries namespace for retryPrompt', function (done) { 
        var connector = new builder.ConsoleConnector();
        var lib = new builder.Library('TestLib');       
        lib.localePath('./libLocale/');
        var bot = new builder.UniversalBot(connector);
        bot.library(lib);
        bot.dialog('/', function (session, args) {
            session.beginDialog('TestLib:/');
        });
        lib.dialog('/', function (session) {
            builder.Prompts.number(session, 'lib2', { retryPrompt: 'lib3' });
        });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'lib-en2':
                    connector.processMessage('invalid');
                    break;
                case 'lib-en3':
                    done();
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should use bots namespace for cancelAction', function (done) { 
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            builder.Prompts.text(session, 'id1');
        }).cancelAction('cancelTest', 'id4', { 
            matches: /cancel/i,
            confirmPrompt: 'id2' 
        });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'index-en1':
                    connector.processMessage('cancel');
                    break;
                case 'index-en2':
                    connector.processMessage('yes');
                    break;
                case 'index-en4':
                    done();
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should use bots namespace for reloadAction', function (done) { 
        var reloaded = false;
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.dialog('/', function (session, args) {
            builder.Prompts.text(session, 'id1');
        }).reloadAction('reloadTest', 'id2', { matches: /reload/i });
        bot.on('send', function (message) {
            switch (message.text) {
                case 'index-en1':
                    if (!reloaded) {
                        connector.processMessage('reload');
                    } else {
                        done();
                    }
                    break;
                case 'index-en2':
                    reloaded = true;
                    break;
                default:
                    assert(false);
                    break;
            }
        });
        connector.processMessage('test');
    });

    it('should use bots namespace for endConversationAction', function (done) { 
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.endConversationAction('goodbye', 'id2', { matches: /goodbye/i });
        bot.dialog('/', function (session, args) {
            builder.Prompts.text(session, 'id1');
        });
        bot.on('send', function (message) {
            if (message.text) {
                switch (message.text) {
                    case 'index-en1':
                        connector.processMessage('goodbye');
                        break;
                    case 'index-en2':
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