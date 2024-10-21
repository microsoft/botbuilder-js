const onlyWarn = require("eslint-plugin-only-warn");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    js.configs.recommended,
    ...sharedConfig,
    {
        ignores: ["src/connectorApi/**/*", "src/tokenApi/**/*", "**/*.nock.js"],

    },
    {
        plugins: {
            "only-warn": onlyWarn,
        },
    }]
