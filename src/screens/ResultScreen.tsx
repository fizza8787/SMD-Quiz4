import { StyleSheet, Text, View } from "react-native";
import { Brand } from "../components/Brand";
import { Button } from "../components/Button";
import { colors, headline } from "../theme";

type Props = {
  phoneDisplay: string;
  message: string;
  onReset: () => void;
};

export function ResultScreen({ phoneDisplay, message, onReset }: Props) {
  return (
    <View>
      <Brand step="Done" />
      <View style={styles.seal}>
        <Text style={styles.sealMark}>✓</Text>
      </View>
      <Text style={styles.kicker}>SMS OTP</Text>
      <Text style={headline}>Verification successful</Text>
      <Text style={styles.phone}>{phoneDisplay}</Text>
      <Text style={styles.body}>{message}</Text>
      <Button label="Verify another number" onPress={onReset} />
    </View>
  );
}

const styles = StyleSheet.create({
  seal: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  sealMark: {
    color: colors.onGreen,
    fontSize: 34,
    lineHeight: 40,
  },
  kicker: {
    color: colors.green,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  phone: {
    marginTop: 14,
    color: colors.ink,
    fontSize: 20,
    fontWeight: "700",
  },
  body: {
    marginTop: 8,
    marginBottom: 22,
    color: colors.muted,
    fontSize: 16,
    lineHeight: 23,
  },
});
