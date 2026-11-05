import assert from "node:assert/strict";
import test from "node:test";
import { isE164Phone, isSmsCode } from "./validate.js";

test("accepts international phone numbers", () => {
  assert.equal(isE164Phone("+923001234567"), true);
  assert.equal(isE164Phone("+14155552671"), true);
});

test("rejects local numbers and junk", () => {
  assert.equal(isE164Phone("03001234567"), false);
  assert.equal(isE164Phone("+123"), false);
  assert.equal(isE164Phone(""), false);
  assert.equal(isE164Phone(null), false);
});

test("accepts a 6-digit SMS code only", () => {
  assert.equal(isSmsCode("123456"), true);
  assert.equal(isSmsCode("12345"), false);
  assert.equal(isSmsCode("1234567"), false);
  assert.equal(isSmsCode("12 3456"), false);
});
