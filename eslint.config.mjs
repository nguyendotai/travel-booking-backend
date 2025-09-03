// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node, // dùng cho Node.js
      },
    },
    rules: {
      ...js.configs.recommended.rules, // load rule recommended
    },
  },
]);
