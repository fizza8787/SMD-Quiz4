export const FIREBASE_BRIDGE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="recaptcha-container"></div>
    <script src="https://www.gstatic.com/firebasejs/13.2.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/13.2.0/firebase-auth-compat.js"></script>
    <script>
      var confirmation = null;
      var verifier = null;

      function emit(message) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        }
      }

      window.onerror = function (message) {
        emit({ type: "boot-error", message: String(message) });
      };

      window.__otp = async function (request) {
        try {
          if (request.action === "send") {
            if (!firebase.apps.length) firebase.initializeApp(request.config);
            var auth = firebase.auth();
            auth.settings.appVerificationDisabledForTesting = true;
            if (verifier) {
              try { verifier.clear(); } catch (ignore) {}
              verifier = null;
            }
            var container = document.getElementById("recaptcha-container");
            if (container) container.innerHTML = "";
            verifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
              size: "invisible",
            });
            confirmation = await auth.signInWithPhoneNumber(request.phone, verifier);
            emit({ id: request.id, ok: true, payload: {} });
            return;
          }
          if (request.action === "confirm") {
            if (!confirmation) {
              throw { code: "auth/invalid-verification-id", message: "Request a code first." };
            }
            var result = await confirmation.confirm(request.code);
            emit({
              id: request.id,
              ok: true,
              payload: { phoneNumber: result.user && result.user.phoneNumber },
            });
            return;
          }
          throw { code: "auth/argument-error", message: "Unknown request." };
        } catch (error) {
          emit({
            id: request.id,
            ok: false,
            payload: {
              code: error && error.code,
              message: error && error.message ? String(error.message) : "",
            },
          });
        }
      };

      if (window.firebase && firebase.auth) emit({ type: "ready" });
      else emit({ type: "boot-error", message: "Firebase did not load." });
    </script>
  </body>
</html>`;
