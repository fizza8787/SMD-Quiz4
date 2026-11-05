import AsyncStorage from "@react-native-async-storage/async-storage";
import { configFromEnv, parseFirebaseConfig, type FirebaseConfig } from "./firebaseConfig";

const STORAGE_KEY = "quiz4.firebaseConfig";

export async function loadFirebaseConfig(): Promise<FirebaseConfig | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    const stored = parseFirebaseConfig(raw);
    if (stored) return stored;
  }
  return configFromEnv();
}

export async function saveFirebaseConfig(config: FirebaseConfig): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function clearFirebaseConfig(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
