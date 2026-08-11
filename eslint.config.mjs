import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';

const config = [
  // eslint-config-next ships a flat config array directly; FlatCompat is not needed.
  ...next,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      // Unused imports and variables are how dead code and half-finished
      // refactors survive a build that only checks types.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
    }
  },
  { ignores: ['.next/**', 'node_modules/**'] }
];

export default config;
