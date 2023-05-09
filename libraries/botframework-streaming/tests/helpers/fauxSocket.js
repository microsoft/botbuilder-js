const { Duplex } = require('stream');

module.exports.FauxSocket = class FauxSocket extends Duplex {
    // eslint-disable-next-line no-empty
    _read() {}

    // eslint-disable-next-line no-empty
    _write() {}

    // eslint-disable-next-line no-empty
    setNoDelay() {}

    // eslint-disable-next-line no-empty
    setTimeout() {}
};
