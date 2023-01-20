module.exports = function sleep(durationInMS = 100) {
    return new Promise((resolve) => setTimeout(resolve, durationInMS));
};
