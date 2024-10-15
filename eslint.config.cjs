const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const _import = require("eslint-plugin-import");
const jsdoc = require("eslint-plugin-jsdoc");
const lodash = require("eslint-plugin-lodash");
const mocha = require("eslint-plugin-mocha");
const prettier = require("eslint-plugin-prettier");
const security = require("eslint-plugin-security");

const {
    fixupPluginRules,
} = require("@eslint/compat");

const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = [{
    ignores: ["**/_ts3.4/", "**/dist/", "**/lib/", "**/node_modules/"],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsdoc/recommended",
), {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        import: fixupPluginRules(_import),
        jsdoc,
        lodash,
        mocha,
        prettier,
        security,
    },

    languageOptions: {
        globals: {
            ...globals.node,
        },

        parser: tsParser,
        ecmaVersion: 9,
        sourceType: "module",

        parserOptions: {
            ecmaFeatures: {
                impliedStrict: true,
            },
        },
    },

    settings: {
        jsdoc: {
            ignoreInternal: true,
            ignorePrivate: true,

            tagNamePreference: {
                augments: "extends",
            },
        },
    },

    rules: {
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",

        "@typescript-eslint/ban-types": ["off", {
            types: {
                object: "",
            },
        }],

        "@typescript-eslint/explicit-member-accessibility": ["error", {
            accessibility: "no-public",

            overrides: {
                parameterProperties: "off",
            },
        }],

        "@typescript-eslint/no-unused-vars": ["error", {
            args: "after-used",
            argsIgnorePattern: "^_",
            caughtErrors: "all",
            caughtErrorsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
        }],

        "import/no-extraneous-dependencies": ["error", {
            devDependencies: false,
            optionalDependencies: false,
            peerDependencies: false,
        }],

        "jsdoc/check-tag-names": ["error", {
            definedTags: ["remarks"],
        }],

        "jsdoc/empty-tags": "off",

        "jsdoc/require-jsdoc": ["error", {
            publicOnly: true,
            enableFixer: false,
        }],

        "jsdoc/require-param": "error",
        "jsdoc/require-param-type": "off",
        "jsdoc/require-returns": "error",
        "jsdoc/require-returns-type": "off",
        "lodash/import-scope": ["error"],
        "no-unused-vars": "off",
        "no-var": "error",
        "prefer-const": "error",
        "prettier/prettier": "error",

        quotes: ["error", "single", {
            avoidEscape: true,
        }],

        "security/detect-object-injection": "off",
    },
}, {
    files: ["**/*.test.*", "test/**/*", "tests/**/*"],

    languageOptions: {
        globals: {
            ...globals.mocha,
            ...globals.node,
        },
    },

    rules: {
        "@typescript-eslint/no-var-requires": "off",
        "import/no-extraneous-dependencies": "off",
        "jsdoc/require-jsdoc": "off",
        "jsdoc/require-param": "off",
        "jsdoc/require-returns": "off",
        "mocha/handle-done-callback": ["error"],
        "mocha/no-async-describe": ["error"],
        "mocha/no-mocha-arrows": ["error"],
        "mocha/no-return-from-async": ["error"],
        "mocha/no-sibling-hooks": ["error"],
        "security/detect-non-literal-fs-filename": "off",
    },
}, {
    files: ["src/**/*.ts"],

    plugins: {
        jsdoc,
    },

    rules: {
        "jsdoc/require-jsdoc": ["warn", {
            require: {
                FunctionDeclaration: true,
                MethodDefinition: false,
                ClassDeclaration: true,
                ArrowFunctionExpression: false,
                FunctionExpression: false,
            },

            publicOnly: true,

            contexts: [
                "MethodDefinition:not([accessibility=/(private|protected)/]) > FunctionExpression",
            ],
        }],
    },
}, {
    files: ["**/*.config.js"],

    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    rules: {
        "@typescript-eslint/no-var-requires": "off",
    },
}];
