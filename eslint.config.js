import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
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
      "no-unused-vars": ["warn"],
      "no-console": "off",
    },
  },
  {
    ignores: ["dist/", "build/", "node_modules/"],
  },
];
