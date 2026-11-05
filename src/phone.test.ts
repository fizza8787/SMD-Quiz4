import assert from "node:assert/strict";
import test from "node:test";
import { formatE164, toE164 } from "./phone.ts";

test("Pakistan trunk prefix 0 becomes E.164", () => {
  assert.equal(toE164("92", "03001234567"), "+923001234567");
});

test("national digits without a trunk prefix are kept", () => {
  assert.equal(toE164("92", "3001234567"), "+923001234567");
});

test("a pasted international number must match the selected country", () => {
  assert.equal(toE164("92", "+92 300 1234567"), "+923001234567");
  assert.equal(toE164("92", "+14155552671"), null);
});

test("US numbers stay 10 digits under +1", () => {
  assert.equal(toE164("1", "4155552671"), "+14155552671");
  assert.equal(toE164("1", "1 415 555 2671"), "+14155552671");
});

test("does not strip a national number that happens to start with the country code", () => {
  assert.equal(toE164("91", "9123456789"), "+919123456789");
  assert.equal(toE164("91", "919876543210"), "+919876543210");
});

test("accepts a 00 international prefix for the selected country", () => {
  assert.equal(toE164("92", "00923001234567"), "+923001234567");
});

test("rejects empty and too-short numbers", () => {
  assert.equal(toE164("92", ""), null);
  assert.equal(toE164("92", "12345"), null);
});

test("formats a verified number for display", () => {
  assert.equal(formatE164("+923001234567", "92"), "+92 300 123 4567");
});
