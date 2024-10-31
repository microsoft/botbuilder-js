const onlyWarn = require("eslint-plugin-only-warn");
const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    ...sharedConfig,
    {
        ignores: ["**/vendor/"],
    },
    {
        plugins: {
            "only-warn": onlyWarn,
        },
    }];
