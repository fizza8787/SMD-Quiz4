import { deleteApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { friendlyAuthError } from "./authErrors";
import type { FirebaseConfig } from "./firebaseConfig";

let confirmation: ConfirmationResult | null = null;
let verifier: RecaptchaVerifier | null = null;

function asError(error: unknown): Error {
  const code =
    typeof error === "object" && error && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;
  const fallback = error instanceof Error ? error.message : undefined;
  return new Error(friendlyAuthError(code, fallback));
}

function authFor(config: FirebaseConfig) {
  const options: FirebaseOptions = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    appId: config.appId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
  };
  const app = getApps().length ? getApps()[0] : initializeApp(options);
  const auth = getAuth(app);
  auth.settings.appVerificationDisabledForTesting = true;
  return auth;
}

export async function requestFirebaseCode(config: FirebaseConfig, phone: string): Promise<void> {
  if (typeof document === "undefined" || !document.getElementById("recaptcha-container")) {
    throw new Error("Reload the page, then request the code again.");
  }
  const auth = authFor(config);
  if (verifier) {
    try {
      verifier.clear();
    } catch {
      /* The previous widget is already gone. */
    }
    verifier = null;
  }
  try {
    verifier = new RecaptchaVerifier(auth, "recaptcha-container", { size: "invisible" });
    confirmation = await signInWithPhoneNumber(auth, phone, verifier);
  } catch (error) {
    confirmation = null;
    verifier = null;
    throw asError(error);
  }
}

export async function confirmFirebaseCode(code: string): Promise<string | null> {
  if (!confirmation) {
    throw new Error("Request a code before entering it.");
  }
  try {
    const credential = await confirmation.confirm(code);
    return credential.user.phoneNumber;
  } catch (error) {
    throw asError(error);
  }
}

export async function resetFirebaseApp(): Promise<void> {
  confirmation = null;
  if (verifier) {
    try {
      verifier.clear();
    } catch {
      /* The widget is already gone. */
    }
    verifier = null;
  }
  await Promise.all(
    getApps().map(async (app) => {
      try {
        await deleteApp(app);
      } catch {
        /* A second reset can overlap the first. */
      }
    }),
  );
}
