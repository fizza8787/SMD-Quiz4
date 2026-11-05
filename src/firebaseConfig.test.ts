import assert from "node:assert/strict";
import test from "node:test";
import { parseFirebaseConfig } from "./firebaseConfig.ts";

const sample = {
  apiKey: "AIzaSyExampleKey12345",
  authDomain: "quiz-app.firebaseapp.com",
  projectId: "quiz-app",
  storageBucket: "quiz-app.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef",
};

test("parses a JSON firebaseConfig", () => {
  const config = parseFirebaseConfig(JSON.stringify(sample));
  assert.equal(config?.projectId, "quiz-app");
  assert.equal(config?.apiKey, sample.apiKey);
});

test("parses the snippet copied from the Firebase console", () => {
  const snippet = `const firebaseConfig = {
    apiKey: "${sample.apiKey}",
    authDomain: "${sample.authDomain}",
    projectId: "${sample.projectId}",
    storageBucket: "${sample.storageBucket}",
    messagingSenderId: "${sample.messagingSenderId}",
    appId: "${sample.appId}",
  };`;
  assert.equal(parseFirebaseConfig(snippet)?.appId, sample.appId);
});

test("rejects a paste that is not a Firebase config", () => {
  assert.equal(parseFirebaseConfig("hello"), null);
  assert.equal(parseFirebaseConfig('{"apiKey":"short"}'), null);
});
