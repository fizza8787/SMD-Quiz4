import { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { COUNTRIES, type Country } from "../phone";
import { colors, serif } from "../theme";

type Props = {
  country: Country;
  onChange: (country: Country) => void;
};

export function CountryField({ country, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return COUNTRIES;
    return COUNTRIES.filter((item) => {
      return (
        item.name.toLowerCase().includes(needle) ||
        item.iso.toLowerCase().includes(needle) ||
        item.dial.includes(needle.replace("+", ""))
      );
    });
  }, [query]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Country ${country.name}, plus ${country.dial}`}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View>
          <Text style={styles.label}>Country</Text>
          <Text style={styles.value}>{country.name}</Text>
        </View>
        <Text style={styles.dial}>+{country.dial}</Text>
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        transparent
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Country code</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Text style={styles.close}>Close</Text>
              </Pressable>
            </View>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search country or code"
              placeholderTextColor={colors.muted}
              autoCorrect={false}
              style={styles.search}
            />
            <FlatList
              data={results}
              keyExtractor={(item) => item.iso}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => {
                const selected = item.iso === country.iso;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item);
                      setOpen(false);
                      setQuery("");
                    }}
                    style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                  >
                    <Text style={styles.iso}>{item.iso}</Text>
                    <Text style={styles.optionName}>{item.name}</Text>
                    <Text style={[styles.optionDial, selected && styles.optionDialOn]}>
                      +{item.dial}
                    </Text>
                  </Pressable>
                );
              }}
              ListEmptyComponent={<Text style={styles.empty}>No country matches that search.</Text>}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pressed: { opacity: 0.72 },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  value: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: "600",
  },
  dial: {
    fontFamily: serif,
    fontSize: 22,
    color: colors.green,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(26, 36, 32, 0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "78%",
    backgroundColor: colors.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 18,
    paddingBottom: 20,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sheetTitle: {
    fontFamily: serif,
    fontSize: 24,
    color: colors.ink,
  },
  close: {
    color: colors.green,
    fontWeight: "700",
    fontSize: 15,
  },
  search: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iso: {
    width: 32,
    color: colors.muted,
    fontWeight: "700",
    fontSize: 13,
  },
  optionName: {
    flex: 1,
    color: colors.ink,
    fontSize: 16,
  },
  optionDial: {
    color: colors.ink,
    fontWeight: "600",
    fontSize: 15,
  },
  optionDialOn: { color: colors.green },
  empty: {
    padding: 24,
    textAlign: "center",
    color: colors.muted,
  },
});
