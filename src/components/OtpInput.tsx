import { useEffect, useRef, type ComponentRef } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { CODE_LENGTH } from "../phone";
import { colors, serif } from "../theme";

type Props = {
  digits: string[];
  onChange: (digits: string[]) => void;
  invalid?: boolean;
};

export function OtpInput({ digits, onChange, invalid }: Props) {
  const refs = useRef<Array<ComponentRef<typeof TextInput> | null>>([]);

  useEffect(() => {
    const timer = setTimeout(() => refs.current[0]?.focus(), 280);
    return () => clearTimeout(timer);
  }, []);

  function changeAt(index: number, text: string) {
    const cleaned = text.replace(/\D/g, "");
    if (!cleaned) {
      const next = digits.slice();
      next[index] = "";
      onChange(next);
      return;
    }

    if (cleaned.length === 1) {
      const next = digits.slice();
      next[index] = cleaned;
      onChange(next);
      if (index < CODE_LENGTH - 1) refs.current[index + 1]?.focus();
      return;
    }

    const typedOver =
      cleaned.length === 2 && digits[index] && cleaned.startsWith(digits[index])
        ? cleaned[1]
        : "";
    if (typedOver) {
      const next = digits.slice();
      next[index] = typedOver;
      onChange(next);
      if (index < CODE_LENGTH - 1) refs.current[index + 1]?.focus();
      return;
    }

    const next = Array.from({ length: CODE_LENGTH }, () => "");
    cleaned
      .slice(0, CODE_LENGTH)
      .split("")
      .forEach((char, offset) => {
        next[offset] = char;
      });
    onChange(next);
    const focusAt = Math.min(cleaned.length, CODE_LENGTH) - 1;
    refs.current[Math.max(focusAt, 0)]?.focus();
  }

  function onKeyPress(index: number, key: string) {
    if (key !== "Backspace" || digits[index] || index === 0) return;
    const next = digits.slice();
    next[index - 1] = "";
    onChange(next);
    refs.current[index - 1]?.focus();
  }

  return (
    <View style={styles.row}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          value={digit}
          onChangeText={(text) => changeAt(index, text)}
          onKeyPress={({ nativeEvent }) => onKeyPress(index, nativeEvent.key)}
          keyboardType="number-pad"
          textContentType={index === 0 ? "oneTimeCode" : "none"}
          autoComplete={index === 0 ? "sms-otp" : "off"}
          importantForAutofill={index === 0 ? "yes" : "no"}
          maxLength={index === 0 ? CODE_LENGTH : 2}
          selectTextOnFocus
          selectionColor={colors.green}
          style={[
            styles.box,
            digit ? styles.filled : null,
            invalid ? styles.invalid : null,
          ]}
          accessibilityLabel={`Digit ${index + 1}`}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    width: "100%",
    gap: 8,
  },
  box: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.white,
    textAlign: "center",
    fontFamily: serif,
    fontSize: 22,
    color: colors.ink,
    paddingHorizontal: 0,
    ...Platform.select({
      android: { paddingVertical: 0 },
    }),
  },
  filled: {
    borderColor: colors.green,
    backgroundColor: "#F3F7F4",
  },
  invalid: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerBg,
  },
});
