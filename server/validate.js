export function isE164Phone(value) {
  return typeof value === "string" && /^\+[1-9]\d{7,14}$/.test(value);
}

export function isSmsCode(value) {
  return typeof value === "string" && /^\d{6}$/.test(value);
}
