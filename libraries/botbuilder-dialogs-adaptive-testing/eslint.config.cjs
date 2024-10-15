const onlyWarn = require("eslint-plugin-only-warn");
const js = require("@eslint/js");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    js.configs.recommended,
    ...sharedConfig,
    {
        files: ["**/*.js, **/*.ts"],
    },
    {
        plugins: {
            "only-warn": onlyWarn,
        },
    }];
