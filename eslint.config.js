// eslint.config.js
import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        document: "readonly",
        DOMParser: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        process: "readonly",
      },
    },
  },
];
