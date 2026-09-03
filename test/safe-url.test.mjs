import assert from "node:assert/strict";
import test from "node:test";
import { getSafeVideoUrl } from "../lib/utils/safe-url.ts";

test("accepts HTTPS, local HTTP, and same-origin paths", () => {
  assert.equal(getSafeVideoUrl("https://video.example/watch/1"), "https://video.example/watch/1");
  assert.equal(getSafeVideoUrl("http://localhost:8080/video"), "http://localhost:8080/video");
  assert.equal(getSafeVideoUrl("/media/video.mp4"), "/media/video.mp4");
});

test("rejects unsafe and unexpected URL schemes", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "vbscript:msgbox(1)",
    "file:///tmp/video.mp4",
    "ftp://example.com/video.mp4",
    "//example.com/video.mp4",
    "http://example.com/video.mp4",
  ]) {
    assert.equal(getSafeVideoUrl(value), undefined);
  }
});
