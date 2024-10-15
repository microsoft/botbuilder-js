const js = require("@eslint/js");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    js.configs.recommended,
    ...sharedConfig,
    {
        ignores: ["src/connectorApi/**/*", "src/tokenApi/**/*", "**/*.nock.js"],
        files: ["**/*.js, **/*.ts"],
    }
]
