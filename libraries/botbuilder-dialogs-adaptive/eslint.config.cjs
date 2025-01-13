const sharedConfig = require('../../eslint.config.cjs');

module.exports = [
    ...sharedConfig,
    {
        ignores: ['tests/choiceSet.test.js', 'tests/expressionProperty.test.js'],
    },
];
