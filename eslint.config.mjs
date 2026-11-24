import next from "eslint-config-next/core-web-vitals";
export default [
  ...next,
  { rules: { "@next/next/no-img-element": "off" } },
  { ignores: [".qa/**", ".next/**", ".npm-cache/**", ".data/**"] },
];
