const { StatusCodes } = require('botbuilder-core');

class MockNetSocket {
    constructor(readable = true, writable = true) {
        this.readable = readable;
        this.writable = writable;
    }

    write(_response) {}

    destroy(_err) {}
}

MockNetSocket.createNonSuccessResponse = (code, message) => {
    return `HTTP/1.1 ${code} ${StatusCodes[code]}\r\n${message}\r\nConnection: 'close'\r\n\r\n`;
};

module.exports.MockNetSocket = MockNetSocket;
