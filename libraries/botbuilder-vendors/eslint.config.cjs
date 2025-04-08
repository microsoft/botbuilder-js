const sharedConfig = require('../../eslint.config.cjs');

module.exports = [
    ...sharedConfig,
    {
        ignores: ['vendors/*'],
    },
];
