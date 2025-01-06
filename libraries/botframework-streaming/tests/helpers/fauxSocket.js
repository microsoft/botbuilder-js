const { Duplex } = require('stream');

module.exports.FauxSocket = class FauxSocket extends Duplex {
    _read() {}

    _write() {}

    setNoDelay() {}

    setTimeout() {}
};
