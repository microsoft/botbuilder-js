/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

module.exports = {
    'presets': [
        [
            '@babel/preset-env',
            {
                'targets': {
                    'browsers': [
                        'last 2 versions'
                    ],
                    'ie': '11'
                }
            }
        ],
        '@babel/preset-typescript'
    ],
    'sourceMaps': 'inline',
    'plugins': [
        '@babel/proposal-class-properties'
    ]
};
