const MESSAGES: Record<string, string> = {
  "auth/invalid-verification-code":
    "Verification failed. That is not the 6-digit code saved for this number in Firebase.",
  "auth/missing-verification-code": "Enter the 6-digit code you saved in Firebase.",
  "auth/code-expired":
    "That code expired. Request a code again, then enter the same code from the Firebase console.",
  "auth/invalid-phone-number":
    "That phone number is not valid. Use the same number you saved in Firebase, including the country code.",
  "auth/missing-phone-number": "Enter the phone number you saved in Firebase.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes, then try again.",
  "auth/quota-exceeded": "Firebase blocked more attempts for now. Wait and try again.",
  "auth/operation-not-allowed":
    "Add this number under Authentication → Sign-in method → Phone → Phone numbers for testing, with a 6-digit code. Then enter that same code here.",
  "auth/invalid-app-credential":
    "Firebase rejected this number. Add it under Phone numbers for testing, using the same country code shown here.",
  "auth/missing-client-identifier":
    "Firebase rejected this number. Add it under Phone numbers for testing, using the same country code shown here.",
  "auth/missing-app-credential":
    "Firebase rejected this number. Add it under Phone numbers for testing, using the same country code shown here.",
  "auth/invalid-api-key":
    "Firebase rejected the config. Copy firebaseConfig again from Project settings.",
  "auth/api-key-not-valid":
    "Firebase rejected the config. Copy firebaseConfig again from Project settings.",
  "auth/network-request-failed": "Could not reach Firebase. Check the internet connection.",
  "auth/captcha-check-failed": "Firebase could not verify this browser. Reload the page and try again.",
  "auth/unauthorized-domain":
    "This domain is not allowed. In Firebase, open Authentication → Settings → Authorized domains and add it.",
  "auth/app-not-authorized":
    "This app is not authorized for phone sign-in. Check the web config and the Phone provider.",
  "auth/invalid-verification-id": "Request a code again, then enter the code saved in Firebase.",
  "auth/session-expired": "That attempt expired. Request a code again.",
  "auth/billing-not-enabled":
    "Add this number under Phone numbers for testing. A real SMS needs the Firebase Blaze plan.",
};

export function friendlyAuthError(code?: string, fallback?: string): string {
  if (code && MESSAGES[code]) return MESSAGES[code];
  if (code) return `Firebase could not verify this number (${code}).`;
  if (fallback && fallback.length > 0 && fallback.length < 180) return fallback;
  return "Firebase could not complete verification.";
}
