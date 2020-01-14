const { doesGlobalFileReaderExist, doesGlobalWebSocketExist } = require('../lib/utilities');
const chai = require('chai');
const expect = chai.expect;

describe('Internal Utilities', () => {
    it('doesGlobalWebSocketExist() should return true if global.WebSocket is truthy', () => {
        global.WebSocket = {};
        try {
            expect(doesGlobalWebSocketExist()).to.be.true;
        } finally {
            global.WebSocket = undefined;
        }
    });

    it('doesGlobalWebSocketExist() should return false if global.WebSocket is null or undefined', () => {
        expect(doesGlobalWebSocketExist()).to.be.false;

        global.WebSocket = null;
        try {
            expect(doesGlobalWebSocketExist()).to.be.false;
        } finally {
            global.WebSocket = undefined;
        }
    });

    it('doesGlobalFileReaderExist() should return true if global.FileReader is truthy', () => {
        global.FileReader = {};
        try {
            expect(doesGlobalFileReaderExist()).to.be.true;
        } finally {
            global.FileReader = undefined;
        }
    });

    it('doesGlobalFileReaderExist() should return false if global.FileReader is null or undefined', () => {
        expect(doesGlobalFileReaderExist()).to.be.false;

        global.FileReader = null;
        try {
            expect(doesGlobalFileReaderExist()).to.be.false;
        } finally {
            global.FileReader = undefined;
        }
    });
});
