const onlyWarn = require("eslint-plugin-only-warn");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    ...sharedConfig,
    {
        ignores: ["**/generated/*", "**/expressionProperty.test.js"],
    },
    {
        plugins: {
            "only-warn": onlyWarn,
        },
    }];
