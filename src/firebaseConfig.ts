export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  storageBucket?: string;
  messagingSenderId?: string;
};

function envValue(name: string): string {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.[name]?.trim() ?? "";
}

function clean(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function toFirebaseConfig(value: unknown): FirebaseConfig | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const config: FirebaseConfig = {
    apiKey: clean(record.apiKey),
    authDomain: clean(record.authDomain),
    projectId: clean(record.projectId),
    appId: clean(record.appId),
  };
  const storageBucket = clean(record.storageBucket);
  const messagingSenderId = clean(record.messagingSenderId);
  if (storageBucket) config.storageBucket = storageBucket;
  if (messagingSenderId) config.messagingSenderId = messagingSenderId;
  if (config.apiKey.length < 10 || config.projectId.length < 2 || config.appId.length < 5) return null;
  if (!config.authDomain.includes(".")) return null;
  return config;
}

export function parseFirebaseConfig(raw: string): FirebaseConfig | null {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  const body = match[0].replace(/,\s*([}\]])/g, "$1");
  try {
    return toFirebaseConfig(JSON.parse(body));
  } catch {
    try {
      const quoted = body
        .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'([^'\\]*)'/g, '"$1"');
      return toFirebaseConfig(JSON.parse(quoted));
    } catch {
      return null;
    }
  }
}

export function configFromEnv(): FirebaseConfig | null {
  return toFirebaseConfig({
    apiKey: envValue("EXPO_PUBLIC_FIREBASE_API_KEY"),
    authDomain: envValue("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: envValue("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
    appId: envValue("EXPO_PUBLIC_FIREBASE_APP_ID"),
    storageBucket: envValue("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: envValue("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  });
}
