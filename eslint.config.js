import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  prettier,
  eslintPluginUnicorn.configs['flat/recommended'],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        google: 'readonly',
        gtag: 'readonly',
      },
    },
    rules: {
      // Ensures that correct values are returned, which is often a problem when generating directions.
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
        },
      ],
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowAny: false,
          allowBoolean: true,
          allowNullish: false,
          allowNumber: true,
          allowRegExp: false,
          allowNever: false,
        },
      ],
      '@typescript-eslint/unbound-method': 'off',
      // its broken
      'unicorn/expiring-todo-comments': 'off',
      'unicorn/no-array-reduce': 'off',
      'unicorn/no-await-expression-member': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': 'off',
      'unicorn/prevent-abbreviations': [
        'error',
        {
          allowList: {
            // arguments is often an illegal variable name
            args: true,
            $$Props: true,
            Props: true,
            props: true,
            i: true,
            src: true,
            ref: true,
            Ref: true,
          },
        },
      ],
      '@typescript-eslint/no-misused-promises': 'off',
      eqeqeq: 'error',
      'func-style': ['error', 'expression', { allowArrowFunctions: true }],
      yoda: 'error',
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  {
    ignores: ['dist/'],
  }
);
