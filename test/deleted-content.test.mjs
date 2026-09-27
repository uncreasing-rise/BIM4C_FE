import assert from "node:assert/strict";
import test from "node:test";
import { filled, telHref } from "../lib/utils/contact.ts";

test("phone links come only from numbers that have digits", () => {
  assert.equal(telHref("+84 93 2468 099"), "tel:+84932468099");
  assert.equal(telHref("Anh Hiếu: +84 796 879 899"), "tel:+84796879899");
  for (const empty of [undefined, null, "", "   ", "Liên hệ qua email"]) {
    assert.equal(telHref(empty), null);
  }
});

test("deleted or blank list items are dropped instead of rendered", () => {
  assert.deepEqual(filled(["Cam kết", "", "  ", null, undefined, "Bảo mật"]), ["Cam kết", "Bảo mật"]);
  assert.deepEqual(filled([{ title: "A" }, null, undefined]), [{ title: "A" }]);
  assert.deepEqual(filled(undefined), []);
  assert.deepEqual(filled(null), []);
});
