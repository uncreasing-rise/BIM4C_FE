import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
test("a legacy mock flag cannot bypass the required backend URL", () => {
  const result = spawnSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      "import { assertApiEnvironment } from './lib/config/env.ts'; assertApiEnvironment();",
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: "development",
        NEXT_PUBLIC_API_URL: "",
        NEXT_PUBLIC_USE_MOCK_API: "true",
      },
      encoding: "utf8",
    },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /NEXT_PUBLIC_API_URL is required/);
});
