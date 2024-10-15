const js = require("@eslint/js");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    js.configs.recommended,
    ...sharedConfig,
    {
        ignores: ["**/es5/"],
        files: ["**/*.js, **/*.ts"],
    }
]
