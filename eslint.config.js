import vuePlugin from 'eslint-plugin-vue';
import prettierPlugin from 'eslint-plugin-prettier';
import pkg from '@typescript-eslint/parser';

const { Parser } = pkg; 

export default [
  {
    languageOptions: {
      parser: Parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin,
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error', 
    },
    files: ['**/*.js', '**/*.vue', '**/*.ts', '**/*.tsx'],
  },
];
