import { useRef, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import WebView from "react-native-webview";
import type { WebViewMessageEvent } from "react-native-webview";
import { friendlyAuthError } from "./authErrors";
import { confirmFirebaseCode, requestFirebaseCode } from "./firebaseAuth";
import { FIREBASE_BRIDGE_HTML } from "./firebaseBridgeHtml";
import type { FirebaseConfig } from "./firebaseConfig";

type Payload = { code?: string; message?: string; phoneNumber?: string | null };
type Waiter = {
  resolve: (value: Payload) => void;
  reject: (error: Error) => void;
};

export function useFirebasePhoneAuth(config: FirebaseConfig | null) {
  const webRef = useRef<WebView<object>>(null);
  const pending = useRef(new Map<string, Waiter>());
  const readyRef = useRef(Platform.OS === "web");
  const seq = useRef(0);
  const [ready, setReady] = useState(Platform.OS === "web");

  function markReady(value: boolean) {
    readyRef.current = value;
    setReady(value);
  }

  function onMessage(event: WebViewMessageEvent) {
    let data: { type?: string; id?: string; ok?: boolean; payload?: Payload };
    try {
      data = JSON.parse(event.nativeEvent.data) as typeof data;
    } catch {
      return;
    }
    if (data.type === "ready") {
      markReady(true);
      return;
    }
    if (data.type === "boot-error") {
      markReady(false);
      return;
    }
    if (!data.id) return;
    const waiter = pending.current.get(data.id);
    if (!waiter) return;
    pending.current.delete(data.id);
    if (data.ok) waiter.resolve(data.payload ?? {});
    else waiter.reject(new Error(friendlyAuthError(data.payload?.code, data.payload?.message)));
  }

  function waitUntilReady(): Promise<void> {
    if (readyRef.current && webRef.current) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (readyRef.current && webRef.current) {
          clearInterval(timer);
          resolve();
        } else if (Date.now() - started > 15000) {
          clearInterval(timer);
          reject(new Error("Firebase did not load. Check the internet connection and try again."));
        }
      }, 150);
    });
  }

  function call(action: "send" | "confirm", extra: Record<string, string>): Promise<Payload> {
    if (!config) return Promise.reject(new Error("Add the Firebase web config first."));
    const webview = webRef.current;
    if (!webview) return Promise.reject(new Error("Firebase is still loading. Wait a moment and try again."));
    const id = String(++seq.current);
    const request = { id, action, config, ...extra };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (!pending.current.has(id)) return;
        pending.current.delete(id);
        reject(new Error("Firebase took too long to respond."));
      }, 30000);
      pending.current.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
      webview.injectJavaScript(`window.__otp(${JSON.stringify(request)}); true;`);
    });
  }

  async function send(phone: string): Promise<void> {
    if (!config) throw new Error("Add the Firebase web config first.");
    if (Platform.OS === "web") {
      await requestFirebaseCode(config, phone);
      return;
    }
    await waitUntilReady();
    await call("send", { phone });
  }

  async function confirm(code: string): Promise<string | null> {
    if (Platform.OS === "web") return confirmFirebaseCode(code);
    await waitUntilReady();
    const payload = await call("confirm", { code });
    return payload.phoneNumber ?? null;
  }

  const element =
    Platform.OS === "web" ? (
      <View nativeID="recaptcha-container" style={styles.anchor} />
    ) : config ? (
      <View pointerEvents="none" style={styles.nativeHost}>
        <WebView<object>
          key={config.projectId + config.appId}
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html: FIREBASE_BRIDGE_HTML, baseUrl: `https://${config.authDomain}` }}
          onMessage={onMessage}
          onError={() => markReady(false)}
          javaScriptEnabled
          domStorageEnabled
          setSupportMultipleWindows={false}
        />
      </View>
    ) : null;

  return { element, ready, send, confirm };
}

const styles = StyleSheet.create({
  anchor: {
    width: 1,
    height: 1,
    overflow: "hidden",
  },
  nativeHost: {
    position: "absolute",
    left: -2400,
    top: 0,
    width: 320,
    height: 240,
  },
});
