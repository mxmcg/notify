const expo = require("eslint-config-expo");

module.exports = {
  ...expo,

  ignorePatterns: ["**/build/"],

  extends: ["plugin:prettier/recommended"],
  overrides: [
    {
      files: ["src/**/*.ts", "src/**/*.tsx", "scripts/**/*.js"],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ["react", "react-native", "@typescript-eslint"],
      extends: [
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-native/all",
      ],
      rules: {
        "no-undef": "error",
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_" },
        ],
        "react/jsx-uses-react": "warn",
        "react/jsx-uses-vars": "warn",
        "react-native/no-inline-styles": "warn",
        "react-native/no-color-literals": "off",
        "react-native/no-unused-styles": "warn",
        "react-native/split-platform-components": "warn",
        "react-native/no-raw-text": "warn",

        "prettier/prettier": [
          "error",
          {
            bracketSameLine: false,
            jsxSingleQuote: true,
            semi: false,
            singleQuote: true,
            trailingComma: "none",
            tabWidth: 2,
            useTabs: true,
            endOfLine: "lf",
          },
        ],
      },
      settings: {
        react: {
          version: "detect",
        },
      },
      env: {
        browser: false,
        node: true,
      },
      globals: {
        require: "readonly",
        process: "readonly",
        console: "readonly",
        __dirname: "readonly",
        module: "readonly",
        exports: "readonly",
        setTimeout: "readonly",
      },
    },
  ],
};
