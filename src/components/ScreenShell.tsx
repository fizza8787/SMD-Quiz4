import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, screen } from "../theme";

export function ScreenShell({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <View style={styles.main}>{children}</View>
          <Text style={styles.course}>22i-8787 · Quiz 4</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 18,
  },
  main: { flexGrow: 1, width: "100%" },
  course: {
    marginTop: 28,
    textAlign: "center",
    color: colors.muted,
    fontSize: 12,
    letterSpacing: 0.4,
  },
});
