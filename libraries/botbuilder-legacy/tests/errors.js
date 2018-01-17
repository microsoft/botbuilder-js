var assert = require('assert');
var builder = require('../');

/*
describe('errors', function() {
    this.timeout(10000);

//=============================================================================
// Basic Dialogs
//=============================================================================

    it('should catch an exception from a Dialog based on a closure.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        bot.dialog('/', function (session) {
            throw "test";
        });
        connector.processMessage('hello');
    });

    it('should catch an exception from a Dialog based on a waterfall.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        bot.dialog('/', [
            function (session) {
                throw "test";
            }
        ]);
        connector.processMessage('hello');
    });

//=============================================================================
// IntentDialog
//=============================================================================

    it('should catch an exception from a IntentDialog.onBegin() handler.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        var dialog = new builder.IntentDialog();
        bot.dialog('/', dialog);
        dialog.onBegin(function (session, args, next) {
            throw "test";
        });
        connector.processMessage('hello');
    });

    it('should catch an exception from a IntentDialog.matches() handler based on a closure.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        var dialog = new builder.IntentDialog();
        bot.dialog('/', dialog);
        dialog.matches(/hello/i, function (session) {
            throw "test";
        });
        connector.processMessage('hello');
    });

    it('should catch an exception from a IntentDialog.matches() handler based on a waterfall.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        var dialog = new builder.IntentDialog();
        bot.dialog('/', dialog);
        dialog.matches(/hello/i, [
            function (session) {
                throw "test";
            }
        ]);
        connector.processMessage('hello');
    });
    
    it('should catch an exception from a IntentDialog.onDefault() handler based on a closure.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        var dialog = new builder.IntentDialog();
        bot.dialog('/', dialog);
        dialog.onDefault(function (session) {
            throw "test";
        });
        connector.processMessage('hello');
    });

    it('should catch an exception from a IntentDialog.onDefault() handler based on a waterfall.', function (done) {
        var connector = new builder.ConsoleConnector();
        var bot = new builder.UniversalBot(connector);
        bot.on('error', function (err) {
            assert(err && err.message == 'test');
            done();
        });
        var dialog = new builder.IntentDialog();
        bot.dialog('/', dialog);
        dialog.onDefault([
            function (session) {
                throw "test";
            }
        ]);
        connector.processMessage('hello');
    });
});
*/