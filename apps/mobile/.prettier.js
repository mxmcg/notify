/** Prettier Config
 *  For main/basic Prettier:
 *  @see https://prettier.io/
 *
 *  For imports ordering:
 *  @see https://github.com/trivago/prettier-plugin-sort-imports
 *  @see https://dev.to/diballesteros/how-to-quickly-sort-imports-with-prettier-3po7
 *  importOrder setting uses regex's to order .js/.ts imports in the order
 *  of the array. Each line is separated by importOrderSeparation.
 */

module.exports = {
  bracketSameLine: false,
  importOrder: [
    "^react$",
    "^@react-native$",
    "^@assets/(.*)$",
    "^@hooks/(.*)$",
    "^@components/(.*)$",
    "^@constants/(.*)$",
    "^@context/(.*)$",
    "^@typeDefs/(.*)$",
    "^@utils/(.*)$",
    "^@state/(.*)$",
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  jsxSingleQuote: true,
  semi: false,
  singleQuote: true,
  trailingComma: "none",
  tabWidth: 2,
  useTabs: true,
  endOfLine: "lf",
  overrides: [
    {
      files: [".env.template", "pre-commit"],
      options: { parser: "sh" },
    },
  ],
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-sh"],
};
