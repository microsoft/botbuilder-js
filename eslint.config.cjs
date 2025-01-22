/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const globals = require('globals');
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

const importPlugin = require('eslint-plugin-import');
const jsdocPlugin = require('eslint-plugin-jsdoc');
const lodashPlugin = require('eslint-plugin-lodash');
const mochaPlugin = require('eslint-plugin-mocha');
const prettierPluginRecommended = require('eslint-plugin-prettier/recommended');
const securityPlugin = require('eslint-plugin-security');
const botbuilderPlugin = require('./tools/eslint/plugins/botbuilder');
const path = require('path');

module.exports = config = [
    // Base configurations.
    botbuilderPlugin.configs.processors.disableLine({
        'import/no-extraneous-dependencies': [/@microsoft\/recognizers-text/],
    }),
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    jsdocPlugin.configs['flat/recommended-typescript'],
    mochaPlugin.configs.flat.recommended,
    prettierPluginRecommended,
    securityPlugin.configs.recommended,

    // Global ignores setting.
    // Using 'ignores' without any other keys will cause the patterns to be applied globally.
    // More information: https://eslint.org/docs/v9.x/use/configure/configuration-files#globally-ignoring-files-with-ignores
    {
        ignores: [
            '**/node_modules',
            '**/lib',
            '**/dist',
            '**/_ts3.4',
            '**/tests/resources',
            '**/*.lu',
            '**/*.dialog',
            '**/*.js.map',
            '**/vendors',
        ],
    },

    // Global settings.
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 9,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    impliedStrict: true,
                },
            },
        },
        plugins: {
            lodash: lodashPlugin,
        },
        settings: {
            jsdoc: {
                ignoreInternal: true,
                ignorePrivate: true,
            },
        },
    },

    // TypeScript and JavaScript settings.
    {
        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-empty-object-type': [
                'error',
                {
                    allowObjectTypes: 'always',
                },
            ],
            '@typescript-eslint/no-restricted-types': [
                'off',
                {
                    types: {
                        object: '',
                    },
                },
            ],
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'no-public',
                    overrides: {
                        properties: 'off',
                    },
                },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                },
            ],
            'import/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: false,
                    optionalDependencies: false,
                    peerDependencies: false,
                },
            ],
            'jsdoc/check-tag-names': [
                'error',
                {
                    definedTags: ['remarks'],
                },
            ],
            'jsdoc/empty-tags': 'off',
            'jsdoc/require-jsdoc': [
                'error',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: false,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false,
                        FunctionExpression: false,
                    },
                    publicOnly: true,
                    enableFixer: false,
                    contexts: ['MethodDefinition:not([accessibility=/(private|protected)/]) > FunctionExpression'],
                },
            ],
            'jsdoc/require-param': 'error',
            'jsdoc/require-returns': 'error',
            'jsdoc/require-returns-type': 'off',
            'jsdoc/no-types': 'off',
            'jsdoc/tag-lines': [
                'error',
                'any',
                {
                    startLines: 1,
                },
            ],
            'lodash/import-scope': 'error',
            'prettier/prettier': [
                'error',
                {
                    singleQuote: true,
                },
            ],
            'security/detect-object-injection': 'off',
        },
    },

    // JavaScript settings.
    {
        files: ['**/*.{js,mjs,cjs}'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
            'jsdoc/no-undefined-types': 1,
            'jsdoc/require-param-type': 'off',
        },
    },

    // JavaScript and TypeScript unit tests settings.
    {
        files: ['**/*.test.{js,ts}', 'tests/**/*.{js,ts}'],
        languageOptions: {
            globals: {
                ...globals.mocha,
            },
        },
        rules: {
            'import/no-extraneous-dependencies': 'off',
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param': 'off',
            'jsdoc/require-returns': 'off',
            'mocha/handle-done-callback': 'error',
            'mocha/no-async-describe': 'error',
            'mocha/no-mocha-arrows': 'error',
            'mocha/no-return-from-async': 'error',
            'mocha/no-sibling-hooks': 'error',
            'mocha/no-setup-in-describe': 'off',
            'security/detect-non-literal-fs-filename': 'off',
        },
    },
];

// Apply only to repository tools.
if (
    ['testing', 'tools', 'tsup', 'botbuilder-vendors', 'botbuilder-repo-utils'].some((tool) =>
        process.cwd().includes(`${path.sep}${tool}`),
    )
) {
    config.push({
        rules: {
            'security/detect-non-literal-fs-filename': 'off',
            'mocha/no-exports': 'off',
            'mocha/no-top-level-hooks': 'off',
        },
    });
}
