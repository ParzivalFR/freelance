import coreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tailwindcss from "eslint-plugin-tailwindcss";

const eslintConfig = [
  ...coreWebVitals,
  ...nextTypescript,
  ...tailwindcss.configs["flat/recommended"],
  {
    rules: {
      "tailwindcss/classnames-order": "off",
      "tailwindcss/no-custom-classname": "off",
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
