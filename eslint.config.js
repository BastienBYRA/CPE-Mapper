import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { args: "none", ignoreRestSiblings: true }],
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", "build/", "node_modules/"]
  }
];
