module.exports = {
    env: {
        browser: true,
        es6: true,
        mocha: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        sourceType: 'module',
        "ecmaVersion": 2017,
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true
        }
    },
    rules: {
        indent: ['error', 4],
        semi: ['error', 'never'],
        "no-console": ["error", { allow: ["warn", "error"] }]

    },
    globals: {
        module: true,
        require: true,
        __dirname: true
    }
}