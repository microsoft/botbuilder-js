var assert = require('assert');
var builder = require('../');

/*
describe('promptRecognizers', function() {
    this.timeout(5000);
    it('should recognize a localized RegExp', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeLocalizedRegExp(ctx, 'exp1', '*');
                assert(matches && matches.length == 1);
                assert(matches[0].entity == 'help');
                done();
            }
        });
        connector.processMessage('help');
    });

    it('should NOT recognize a localized RegExp', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeLocalizedRegExp(ctx, 'exp1', '*');
                assert(matches.length == 0);
                done();
            }
        });
        connector.processMessage('foo');
    });

    it('should recognize localized choices', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeLocalizedChoices(ctx, 'choices1', '*');
                assert(matches && matches.length == 1);
                assert(typeof matches[0].entity === 'object');
                assert(matches[0].entity.index === 0);
                assert(matches[0].entity.entity === 'a');
                done();
            }
        });
        connector.processMessage('a');
    });

    it('should recognize a localized choice using a synonym', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeLocalizedChoices(ctx, 'choices1', '*');
                assert(matches && matches.length == 1);
                assert(matches[0].entity.index === 1);
                assert(matches[0].entity.entity === 'b');
                done();
            }
        });
        connector.processMessage('b1');
    });

    it('should recognize a localized choice without any synonyms', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeLocalizedChoices(ctx, 'choices1', '*');
                assert(matches && matches.length == 1);
                assert(matches[0].entity.index === 2);
                assert(matches[0].entity.entity === 'c');
                done();
            }
        });
        connector.processMessage('c');
    });

    it('should NOT recognize a localized choice when value ignored', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var options = { excludeValue: true };
                var matches = builder.PromptRecognizers.recognizeLocalizedChoices(ctx, 'choices1', '*', options);
                assert(matches.length == 0);
                done();
            }
        });
        connector.processMessage('a');
    });

    it('should recognize a boolean true', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeBooleans(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === true);
                done();
            }
        });
        connector.processMessage('yes');
    });

    it('should recognize a boolean false', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeBooleans(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === false);
                done();
            }
        });
        connector.processMessage('no');
    });

    it('should recognize multiple booleans', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeBooleans(ctx);
                assert(matches && matches.length == 2);
                assert(matches[0].entity === true);
                assert(matches[1].entity === false);
                done();
            }
        });
        connector.processMessage('yes and no');
    });

    it('should recognize a cardinal number', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === 1.23);
                done();
            }
        });
        connector.processMessage('1.23');
    });

    it('should recognize a cardinal number using words', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === 7);
                done();
            }
        });
        connector.processMessage('seven');
    });

    it('should recognize negative numbers', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === -13);
                done();
            }
        });
        connector.processMessage('-13');
    });

    it('should recognize positive numbers', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === 12);
                done();
            }
        });
        connector.processMessage('I will take +12');
    });

    it('should recognize multiple numbers', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx);
                assert(matches && matches.length == 2);
                assert(matches[0].entity === 1.7);
                assert(matches[1].entity === 7);
                done();
            }
        });
        connector.processMessage('1.7 and seven');
    });

    it('should recognize only integers', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var options = { integerOnly: true };
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx, options);
                assert(matches && matches.length == 2);
                assert(matches[0].entity === 1);
                assert(matches[1].entity === 7);
                done();
            }
        });
        connector.processMessage('1, 2.3, and seven');
    });

    it('should recognize within a range', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var options = { minValue: 2, maxValue: 5 };
                var matches = builder.PromptRecognizers.recognizeNumbers(ctx, options);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === 2.3);
                done();
            }
        });
        connector.processMessage('1, 2.3, and seven');
    });

    it('should recognize an ordinal', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeOrdinals(ctx);
                assert(matches && matches.length == 1);
                assert(matches[0].entity === 2);
                done();
            }
        });
        connector.processMessage("i'd like the second one");
    });

    it('should recognize a reverse ordinal', function (done) { 
        var connector = new builder.ConsoleConnector();       
        var bot = new builder.UniversalBot(connector);
        bot.use({
            botbuilder: function (session, next) {
                var ctx = session.toRecognizeContext();
                var matches = builder.PromptRecognizers.recognizeOrdinals(ctx);
                assert(matches && matches.length >= 2);
                var top = builder.PromptRecognizers.findTopEntity(matches);
                assert(top.entity === -2);
                done();
            }
        });
        connector.processMessage("i'd like the second to last one");
    });
});
*/