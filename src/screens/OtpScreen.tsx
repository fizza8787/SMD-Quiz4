import { Pressable, StyleSheet, Text, View } from "react-native";
import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import { OtpInput } from "../components/OtpInput";
import { CODE_LENGTH } from "../phone";
import { colors, headline } from "../theme";

type Props = {
  phoneDisplay: string;
  digits: string[];
  onDigits: (digits: string[]) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangeNumber: () => void;
  busy: boolean;
  cooldown: number;
  error: string;
};

export function OtpScreen({
  phoneDisplay,
  digits,
  onDigits,
  onVerify,
  onResend,
  onChangeNumber,
  busy,
  cooldown,
  error,
}: Props) {
  const complete = digits.every((digit) => digit.length === 1);

  return (
    <View>
      <Brand step="Step 2 of 2" />
      <Text style={styles.kicker}>Firebase code</Text>
      <Text style={headline}>Enter the code</Text>
      <Text style={styles.lead}>
        Type the 6-digit code you saved in Firebase for{" "}
        <Text style={styles.phone}>{phoneDisplay}</Text>. A test number does not receive an SMS.
      </Text>

      <View style={styles.otp}>
        <OtpInput digits={digits} onChange={onDigits} invalid={Boolean(error)} />
      </View>

      {error ? (
        <View style={styles.failure} accessibilityRole="alert">
          <Text style={styles.failureTitle}>Verification failed</Text>
          <Text style={styles.failureBody}>{error}</Text>
        </View>
      ) : (
        <Text style={styles.note}>Enter all {CODE_LENGTH} digits from the Firebase console, then verify.</Text>
      )}

      <Button
        label={busy ? "Checking code…" : "Verify code"}
        onPress={onVerify}
        loading={busy}
        disabled={!complete}
      />

      <View style={styles.actions}>
        <Pressable onPress={onResend} disabled={busy || cooldown > 0} hitSlop={8}>
          <Text style={[styles.link, (busy || cooldown > 0) && styles.linkOff]}>
            {cooldown > 0 ? `Request again in 0:${String(cooldown).padStart(2, "0")}` : "Request again"}
          </Text>
        </Pressable>
        <Pressable onPress={onChangeNumber} disabled={busy} hitSlop={8}>
          <Text style={styles.link}>Use a different number</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  lead: {
    marginTop: 10,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
  phone: {
    color: colors.ink,
    fontWeight: "700",
  },
  otp: {
    marginTop: 26,
    marginBottom: 16,
    width: "100%",
    alignSelf: "stretch",
  },
  note: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  failure: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerLine,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  failureTitle: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  failureBody: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    marginTop: 18,
    gap: 12,
  },
  link: {
    color: colors.green,
    fontSize: 15,
    fontWeight: "700",
  },
  linkOff: {
    color: colors.muted,
    fontWeight: "600",
  },
});
