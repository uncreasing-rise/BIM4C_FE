import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  // public/fragments: the ThatOpen worker, copied minified from node_modules.
  globalIgnores([".next/**", ".qa/**", "stitch_bim4c_corporate_web_redesign/**", "public/fragments/**"]),
]);
