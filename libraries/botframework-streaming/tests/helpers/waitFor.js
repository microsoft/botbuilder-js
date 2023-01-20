const { sleep } = require('./sleep');

module.exports.waitFor = async function waitFor(callback, { interval = 50, timeout = 1000 } = {}) {
    let lastError;

    for (const startTime = Date.now(); Date.now() < startTime + timeout; ) {
        try {
            return callback();
        } catch (error) {
            lastError = error;
            await sleep(interval);
        }
    }

    throw lastError || new Error('timed out');
};
