import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import { CountryField } from "../components/CountryField";
import { formatE164, toE164, type Country } from "../phone";
import { colors, headline, serif } from "../theme";

type Props = {
  country: Country;
  onCountry: (country: Country) => void;
  nationalNumber: string;
  onNationalNumber: (value: string) => void;
  onSend: () => void;
  onChangeProject: () => void;
  busy: boolean;
  error: string;
};

export function PhoneScreen({
  country,
  onCountry,
  nationalNumber,
  onNationalNumber,
  onSend,
  onChangeProject,
  busy,
  error,
}: Props) {
  const phone = toE164(country.dial, nationalNumber);
  const preview = phone ? formatE164(phone, country.dial) : null;

  return (
    <View>
      <Brand step="Step 1 of 2" />
      <Text style={styles.kicker}>Firebase phone auth</Text>
      <Text style={headline}>Confirm your number</Text>
      <Text style={styles.lead}>
        Enter the number you saved in Firebase under Phone numbers for testing. The preview must
        match it, including the country code.
      </Text>

      <View style={styles.card}>
        <CountryField country={country} onChange={onCountry} />
        <View style={styles.divider} />
        <View style={styles.field}>
          <Text style={styles.label}>Mobile number</Text>
          <TextInput
            value={nationalNumber}
            onChangeText={(value) => onNationalNumber(value.replace(/[^\d+\s]/g, ""))}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            placeholder="300 1234567"
            placeholderTextColor="#9AA39D"
            selectionColor={colors.green}
            style={styles.input}
            accessibilityLabel="Mobile number"
          />
        </View>
      </View>

      <Text style={styles.preview}>
        {preview
          ? `Firebase will check ${preview}`
          : "Drop the leading 0. The country code is added for you."}
      </Text>

      {error ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorTitle}>Verification failed</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : null}

      <Button
        label={busy ? "Contacting Firebase…" : "Request code"}
        onPress={onSend}
        loading={busy}
        disabled={!phone}
      />

      <View style={styles.note}>
        <Text style={styles.noteBody}>
          A number in Phone numbers for testing does not get an SMS. On the next screen, type the
          6-digit code you saved next to that number in the Firebase console.
        </Text>
        <Pressable onPress={onChangeProject} disabled={busy} hitSlop={8}>
          <Text style={styles.link}>Use a different Firebase project</Text>
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
  card: {
    marginTop: 22,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
  },
  field: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  input: {
    fontFamily: serif,
    fontSize: 28,
    color: colors.ink,
    paddingVertical: 4,
  },
  preview: {
    marginTop: 12,
    marginBottom: 16,
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerLine,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  errorTitle: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 4,
  },
  errorBody: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#E7E1D6",
    gap: 12,
  },
  noteBody: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    color: colors.green,
    fontSize: 15,
    fontWeight: "700",
  },
});
