import type { FlatXoConfig } from 'xo';
import unusedImports from "eslint-plugin-unused-imports";

const config = [
  {
    prettier: 'compat',
    space: true,
    ignores: ['./target/**/*.*'],
     plugins: {
        "unused-imports": unusedImports,
    },
    rules: {
      'unicorn/no-array-reduce': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'capitalized-comments': 'off',
      'import-x/extensions': 'off',
      'no-implicit-coercion': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "warn",
            {
                "vars": "all",
                "varsIgnorePattern": "^_",
                "args": "after-used",
                "argsIgnorePattern": "^_",
            },
        ]
    },
  },
] satisfies FlatXoConfig;

export default config;
