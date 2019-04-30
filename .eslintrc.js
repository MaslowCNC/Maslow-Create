module.exports = {
    env: {
        browser: true,
        es6: true
    },
    extends: 'eslint:recommended',
    parserOptions: {
        sourceType: 'module'
    },
    rules: {
        indent: ['error', 4],
        semi: ['error', 'never']
    },
    globals: {
        module: true,
        require: true,
        __dirname: true
    }
}