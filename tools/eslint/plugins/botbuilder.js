/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const _config = {
    disableLine: {},
};

module.exports = plugin = {
    meta: {
        name: 'eslint-plugin-botbuilder',
        version: '1.0.0',
    },
    processors: {
        disableLine: {
            postprocess(messages) {
                return []
                    .concat(...messages)
                    .filter((e) => !_config.disableLine[e.ruleId]?.some((pattern) => pattern.test(e.message)) ?? true);
            },
        },
    },
    configs: {
        processors: {
            /**
             * @param {Record<string, RegExp[]>} config
             */
            disableLine(config) {
                _config.disableLine = config || {};
                return {
                    name: `botbuilder/processor/disableLine`,
                    processor: `botbuilder/disableLine`,
                    plugins: {
                        botbuilder: plugin,
                    },
                };
            },
        },
    },
};
