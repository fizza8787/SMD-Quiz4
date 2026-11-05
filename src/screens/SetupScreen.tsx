import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import { parseFirebaseConfig, type FirebaseConfig } from "../firebaseConfig";
import { colors, headline, serif } from "../theme";

type Props = {
  onSave: (config: FirebaseConfig) => void;
  busy: boolean;
};

export function SetupScreen({ onSave, busy }: Props) {
  const [raw, setRaw] = useState("");
  const [error, setError] = useState("");

  function save() {
    const config = parseFirebaseConfig(raw);
    if (!config) {
      setError("Paste the firebaseConfig object from Project settings. It needs apiKey, authDomain, projectId, and appId.");
      return;
    }
    setError("");
    onSave(config);
  }

  return (
    <View>
      <Brand step="Firebase" />
      <Text style={styles.kicker}>Phone sign-in</Text>
      <Text style={headline}>Connect Firebase</Text>
      <Text style={styles.lead}>
        The number and code you saved in the console stay there. This app also needs the web
        config so it can check that code.
      </Text>
      <View style={styles.steps}>
        <Text style={styles.step}>1. Open Project settings, the gear next to Project overview.</Text>
        <Text style={styles.step}>2. Under Your apps, select the Web app. Add one if the list is empty.</Text>
        <Text style={styles.step}>3. Copy the firebaseConfig object and paste it below.</Text>
      </View>
      <TextInput
        value={raw}
        onChangeText={(value) => {
          setRaw(value);
          setError("");
        }}
        multiline
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={'{\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "...",\n  appId: "..."\n}'}
        placeholderTextColor="#9AA39D"
        selectionColor={colors.green}
        style={styles.input}
        accessibilityLabel="Firebase config"
      />
      {error ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Text style={styles.errorTitle}>That config could not be read</Text>
          <Text style={styles.errorBody}>{error}</Text>
        </View>
      ) : null}
      <Button label={busy ? "Saving…" : "Save config"} onPress={save} loading={busy} disabled={!raw.trim()} />
      <Text style={styles.hint}>
        Phone must be enabled under Authentication → Sign-in method. The number you added under
        Phone numbers for testing is the one you will enter next. Firebase does not text that
        number. You type the code you saved beside it.
      </Text>
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
  steps: {
    marginTop: 18,
    gap: 8,
  },
  step: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 21,
  },
  input: {
    marginTop: 16,
    marginBottom: 14,
    minHeight: 180,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 16,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: serif,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
    textAlignVertical: "top",
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
  hint: {
    marginTop: 16,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
