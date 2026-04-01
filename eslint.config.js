module.exports = [
  {
    ignores: ["node_modules/", "coverage/", "swagger.json", "__tests__/"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly"
      }
    },
    plugins: {
      prettier: require("eslint-plugin-prettier")
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: true,
          tabWidth: 2,
          trailingComma: "es5",
          printWidth: 100,
          bracketSpacing: true,
          arrowParens: "avoid"
        }
      ],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
      "quote-props": ["error", "as-needed"]
    }
  }
];