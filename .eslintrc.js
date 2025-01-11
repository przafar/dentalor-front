module.exports = {
  parser: 'vue-eslint-parser', // Указываем парсер для Vue
  parserOptions: {
    parser: '@typescript-eslint/parser', // Используем парсер для TypeScript
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended', // Рекомендуемые правила ESLint
    'plugin:vue/vue3-recommended', // Правила для Vue 3
    'plugin:@typescript-eslint/recommended', // Рекомендуемые правила для TypeScript
    'plugin:prettier/recommended', // Интеграция с Prettier
  ],
  plugins: [
    'vue', // Плагин для Vue
    '@typescript-eslint', // Плагин для TypeScript
  ],
  rules: {
    'vue/multi-word-component-names': 'off', // Отключаем правило для многословных имен компонентов Vue
    'prettier/prettier': 'error', // Интеграция с Prettier
  },
  ignorePatterns: ['node_modules/'], // Игнорируем node_modules
};
