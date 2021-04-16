console.log('loaded config file', __filename)

module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'no-empty': ['error', { allowEmptyCatch: true }],
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/member-delimiter-style': [
            'warn',
            {
                multiline: {
                    delimiter: 'comma' | 'semi',
                    requireLast: true,
                },
                singleline: {
                    delimiter: 'semi',
                    requireLast: false,
                },
            },
        ],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                args: 'after-used',
                ignoreRestSiblings: true,
                vars: 'all',
            },
        ],
        '@typescript-eslint/no-use-before-define': [
            'error',
            {
                classes: true,
                functions: false,
            },
        ],
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/unbound-method': 'off',
        'comma-dangle': [
            'warn',
            {
                arrays: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
                imports: 'always-multiline',
                objects: 'always-multiline',
            },
        ],
        'no-console': 'off',
        quotes: ['warn', 'double', { avoidEscape: true }],
        semi: ['warn', 'always'],
        'require-atomic-updates': 'off',
        'no-extra-semi': 'off',
        '@typescript-eslint/no-misused-promises': [
            'error',
            {
                checksVoidReturn: false,
            },
        ],
    },
}
