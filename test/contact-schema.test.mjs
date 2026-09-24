import assert from "node:assert/strict";
import test from "node:test";
import {
  contactSchema,
  courseRegistrationSchema,
  newsletterSchema,
} from "../features/contact/schemas/contact.schema.ts";

// zod-errors.ts imports a type via the "@/" alias, which is erased at runtime.
const { getZodFieldErrors, isValidationError } = await import("../features/contact/utils/zod-errors.ts");

function issuesOf(schema, input) {
  try {
    schema.parse(input);
  } catch (error) {
    return error;
  }
  throw new Error("expected validation to fail");
}

test("contact schema trims input and accepts a valid submission", () => {
  const parsed = contactSchema.parse({
    name: "  Nguyễn Văn A ",
    email: "a@example.com",
    phone: " 0900 ",
    company: "",
    message: "  Chúng tôi cần tư vấn BIM ",
    consent: true,
  });
  assert.equal(parsed.name, "Nguyễn Văn A");
  assert.equal(parsed.phone, "0900");
  assert.equal(parsed.message, "Chúng tôi cần tư vấn BIM");
});

test("validation errors are detected structurally and localized per field", () => {
  const error = issuesOf(contactSchema, { name: "a", email: "bad", message: "short", consent: false });
  assert.equal(isValidationError(error), true);
  assert.equal(isValidationError(new Error("network")), false);
  assert.deepEqual(getZodFieldErrors(error, "vi"), {
    name: "Vui lòng nhập họ và tên của bạn.",
    email: "Vui lòng nhập địa chỉ email hợp lệ.",
    message: "Vui lòng nhập ít nhất 10 ký tự nội dung.",
    consent: "Bạn cần đồng ý với Chính sách bảo mật.",
  });
});

test("newsletter and course registration require consent", () => {
  assert.ok(isValidationError(issuesOf(newsletterSchema, { email: "a@example.com", consent: false })));
  assert.ok(
    isValidationError(
      issuesOf(courseRegistrationSchema, {
        courseId: "c1",
        name: "Nguyen A",
        email: "a@example.com",
        phone: "0900000000",
        consent: false,
      }),
    ),
  );
});
