/**
 * Babel configuration for Jest + ES6 Modules
 * Necessário para que o Jest entenda import/export
 */

export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
  ],
};
