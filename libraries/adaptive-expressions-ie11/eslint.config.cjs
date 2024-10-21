const sharedConfig = require("../../eslint.config.cjs")

module.exports = [
    ...sharedConfig,
    {
        plugins: {
            "only-warn": onlyWarn,
        },
    }
]
