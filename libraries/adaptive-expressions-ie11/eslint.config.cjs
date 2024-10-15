const js = require("@eslint/js");

const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    js.configs.recommended,
    ...sharedConfig,
    {
        files: ["**/*.js, **/*.ts"],
    }
]
