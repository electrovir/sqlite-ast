const {baseConfig} = require('@virmator/spellcheck/configs/cspell.config.base.cjs');

module.exports = {
    ...baseConfig,
    ignorePaths: [
        ...baseConfig.ignorePaths,
        './src/grammar.pegjs',
        './src/parser.ts',
        './src/index.test.ts',
        './src/parse-sqlite.test.ts',
    ],
    words: [
        ...baseConfig.words,
        'savepoint',
        'pegjs',
    ],
};
