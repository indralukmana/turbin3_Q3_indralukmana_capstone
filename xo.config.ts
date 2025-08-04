import type {FlatXoConfig} from 'xo';

const config: FlatXoConfig = {
  prettier: 'compat',
  space: true,
  ignores: ['./target/**/*.*'],
  rules: {
    'unicorn/no-array-reduce': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'capitalized-comments': 'off',
    'import-x/extensions': 'off',
    'no-implicit-coercion': 'off'
  },
};

export default config;
