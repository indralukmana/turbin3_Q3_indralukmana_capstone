
// prettier.config.js, .prettierrc.js, prettier.config.cjs, or .prettierrc.cjs

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  "trailingComma": "es5",
  "overrides": [
    {
      "files": ["*.jsonc"],
      "options": {
        "trailingComma": "none",
        "parser": "jsonc"
      }
    }
  ],
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  printWidth: 80,
  proseWrap: 'always',
  bracketSpacing: true,
};

export default config;