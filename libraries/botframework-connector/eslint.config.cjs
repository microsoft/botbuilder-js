const sharedConfig = require('../../eslint.config.cjs');

module.exports = [
    ...sharedConfig,
    {
        ignores: ['src/connectorApi/**/*', 'src/tokenApi/**/*', '**/*.nock.js'],
    },
];
