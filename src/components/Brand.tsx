import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function Brand({ step }: { step: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.mark}>
        <Text style={styles.markText}>OTP</Text>
      </View>
      <Text style={styles.step}>{step}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  mark: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    color: colors.onGreen,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  step: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.6,
  },
});
