const onlyWarn = require("eslint-plugin-only-warn");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    ...sharedConfig,
    {
        files: ['**/*.js, **/*.ts'],
    },
    {
        plugins: {
            'only-warn': onlyWarn,
        },
    },
];
