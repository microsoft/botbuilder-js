
const chai = require('chai');

const builtin = require('../src/formBuiltinRecognizers.js');

const assert = chai.assert;
const expect = chai.expect;
chai.should();

describe('No Network', () => {
    describe('Form', () => {
        describe('builtin recognizers', () => {
            describe('cancel', () => {
                it('cancel', () => {
                    const context = { request: { text: 'cancel' }, local: {} };
                    builtin.cancel(context).should.be.true;
                });
                it('QUIT', () => {
                    const context = { request: { text: 'QUIT' }, local: {} };
                    builtin.cancel(context).should.be.true;
                });
                it('no', () => {
                    const context = { request: { text: 'no' }, local: {} };
                    builtin.cancel(context).should.be.false;
                });
                it('nowhere', () => {
                    const context = { request: { text: 'nowhere' }, local: {} };
                    builtin.cancel(context).should.be.false;
                });
                it('mono', () => {
                    const context = { request: { text: 'mono' }, local: {} };
                    builtin.cancel(context).should.be.false;
                });
            });
            describe('help', () => {
                it('help', () => {
                    const context = { request: { text: 'help' }, local: {} };
                    builtin.help(context).should.be.true;
                });
                it('Help', () => {
                    const context = { request: { text: 'Help' }, local: {} };
                    builtin.help(context).should.be.true;
                });
                it('cancel', () => {
                    const context = { request: { text: 'cancel' }, local: {} };
                    builtin.help(context).should.be.false;
                });
                it('helper', () => {
                    const context = { request: { text: 'helper' }, local: {} };
                    builtin.help(context).should.be.false;
                });
                it('whelp', () => {
                    const context = { request: { text: 'whelp' }, local: {} };
                    builtin.help(context).should.be.false;
                });
            });
            describe('confirm', () => {
                it('yes', () => {
                    const context = { request: { text: 'yes' }, local: {} };
                    builtin.confirm(context).should.be.true;
                    context.local.should.have.property('confirm', 'yes');
                });
                it('no', () => {
                    const context = { request: { text: 'no' }, local: {} };
                    builtin.confirm(context).should.be.true;
                    context.local.should.have.property('confirm', 'no');
                });
                it('buckethead', () => {
                    const context = { request: { text: 'buckethead' }, local: {} };
                    builtin.help(context).should.be.false;
                });
                it('confirmation', () => {
                    const context = { request: { text: 'confirmation' }, local: {} };
                    builtin.help(context).should.be.false;
                });
                it('reconfirm', () => {
                    const context = { request: { text: 'reconfirm' }, local: {} };
                    builtin.help(context).should.be.false;
                });
            });
        });
    });
});
