import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Platform, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ScreenShell } from "./src/components/ScreenShell";
import { resetFirebaseApp } from "./src/firebaseAuth";
import type { FirebaseConfig } from "./src/firebaseConfig";
import { clearFirebaseConfig, loadFirebaseConfig, saveFirebaseConfig } from "./src/firebaseStorage";
import { COUNTRIES, emptyCode, formatE164, toE164, type Country } from "./src/phone";
import { OtpScreen } from "./src/screens/OtpScreen";
import { PhoneScreen } from "./src/screens/PhoneScreen";
import { ResultScreen } from "./src/screens/ResultScreen";
import { SetupScreen } from "./src/screens/SetupScreen";
import { colors } from "./src/theme";
import { useFirebasePhoneAuth } from "./src/useFirebasePhoneAuth";

type Step = "phone" | "code" | "success";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Flow />
    </SafeAreaProvider>
  );
}

function Flow() {
  const [configReady, setConfigReady] = useState(false);
  const [config, setConfig] = useState<FirebaseConfig | null>(null);
  const [step, setStep] = useState<Step>("phone");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [nationalNumber, setNationalNumber] = useState("");
  const [digits, setDigits] = useState<string[]>(emptyCode);
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingDial, setPendingDial] = useState(COUNTRIES[0].dial);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const firebase = useFirebasePhoneAuth(config);

  useEffect(() => {
    let cancelled = false;
    loadFirebaseConfig().then((stored) => {
      if (!cancelled) {
        setConfig(stored);
        setConfigReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((current) => (current <= 1 ? 0 : current - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown === 0 ? 0 : 1]);

  async function requestCode(phone: string, dial: string) {
    setBusy(true);
    setError("");
    try {
      await firebase.send(phone);
      setPendingPhone(phone);
      setPendingDial(dial);
      setDigits(emptyCode());
      setCooldown(30);
      setStep("code");
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Firebase could not start verification.");
    } finally {
      setBusy(false);
    }
  }

  async function sendFromForm() {
    const phone = toE164(country.dial, nationalNumber);
    if (!phone) {
      setError("Enter a valid mobile number for the selected country.");
      return;
    }
    await requestCode(phone, country.dial);
  }

  async function resendCode() {
    if (cooldown > 0 || busy || !pendingPhone) return;
    await requestCode(pendingPhone, pendingDial);
  }

  async function submitCode() {
    const code = digits.join("");
    if (code.length !== 6) {
      setError("Enter the 6-digit code you saved in Firebase.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await firebase.confirm(code);
      setSuccessMessage("Firebase accepted the code. This phone number is verified.");
      setStep("success");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Could not verify the code.");
    } finally {
      setBusy(false);
    }
  }

  function changeNumber() {
    setBusy(false);
    setError("");
    setDigits(emptyCode());
    setCooldown(0);
    setStep("phone");
  }

  async function reset() {
    if (Platform.OS === "web") await resetFirebaseApp();
    setNationalNumber("");
    setPendingPhone("");
    setDigits(emptyCode());
    setSuccessMessage("");
    setError("");
    setCooldown(0);
    setStep("phone");
  }

  async function changeProject() {
    setBusy(true);
    await clearFirebaseConfig();
    if (Platform.OS === "web") await resetFirebaseApp();
    setConfig(null);
    setError("");
    setDigits(emptyCode());
    setCooldown(0);
    setStep("phone");
    setBusy(false);
  }

  const phoneDisplay = pendingPhone ? formatE164(pendingPhone, pendingDial) : "";

  return (
    <ScreenShell>
      {firebase.element}
      {!configReady ? <Text style={{ color: colors.muted, fontSize: 16 }}>Loading…</Text> : null}
      {configReady && !config ? (
        <SetupScreen
          busy={busy}
          onSave={(next) => {
            setBusy(true);
            saveFirebaseConfig(next)
              .then(() => setConfig(next))
              .finally(() => setBusy(false));
          }}
        />
      ) : null}
      {config && step === "phone" ? (
        <PhoneScreen
          country={country}
          onCountry={(next) => {
            setCountry(next);
            setError("");
          }}
          nationalNumber={nationalNumber}
          onNationalNumber={(value) => {
            setNationalNumber(value);
            setError("");
          }}
          onSend={() => void sendFromForm()}
          onChangeProject={() => void changeProject()}
          busy={busy}
          error={error}
        />
      ) : null}
      {config && step === "code" ? (
        <OtpScreen
          phoneDisplay={phoneDisplay}
          digits={digits}
          onDigits={(next) => {
            setDigits(next);
            setError("");
          }}
          onVerify={() => void submitCode()}
          onResend={() => void resendCode()}
          onChangeNumber={changeNumber}
          busy={busy}
          cooldown={cooldown}
          error={error}
        />
      ) : null}
      {config && step === "success" ? (
        <ResultScreen phoneDisplay={phoneDisplay} message={successMessage} onReset={() => void reset()} />
      ) : null}
    </ScreenShell>
  );
}
