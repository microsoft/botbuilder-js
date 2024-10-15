const onlyWarn = require("eslint-plugin-only-warn");

const js = require("@eslint/js");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    js.configs.recommended,
    ...sharedConfig,
    {
        ignores: ["tests/choiceSet.test.js", "tests/expressionProperty.test.js"],
        files: ["**/*.js, **/*.ts"],
    },
    {
        plugins: {
            "only-warn": onlyWarn,
        },
    }];
