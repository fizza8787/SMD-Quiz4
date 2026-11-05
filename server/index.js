import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import twilio from "twilio";
import { isE164Phone, isSmsCode } from "./validate.js";

const root = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(root, ".env") });

const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("PORT must be an integer from 1 to 65535.");
  process.exit(1);
}

const app = express();
app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "16kb" }));

const sends = new Map();
const checks = new Map();

function allow(bucket, key, limit, windowMs) {
  const now = Date.now();
  const recent = (bucket.get(key) || []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= limit) {
    bucket.set(key, recent);
    return false;
  }
  recent.push(now);
  bucket.set(key, recent);
  return true;
}

function twilioConfigured() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const service = process.env.TWILIO_VERIFY_SERVICE_SID || "";
  return sid.startsWith("AC") && token.length >= 16 && service.startsWith("VA") && !/x{4,}/i.test(sid);
}

function twilioClient() {
  if (!twilioConfigured()) {
    const error = new Error("Twilio Verify is not configured.");
    error.code = "MISSING_CONFIG";
    throw error;
  }
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

function mask(phone) {
  if (typeof phone !== "string" || phone.length < 6) return "***";
  return `${phone.slice(0, 4)}****${phone.slice(-2)}`;
}

function mapError(error, action) {
  if (error?.code === "MISSING_CONFIG") {
    return {
      status: 503,
      message:
        "SMS is not configured. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID to server/.env, then restart the server.",
    };
  }

  const code = error?.code;
  const text = String(error?.message || "");
  if (/unverified/i.test(text) || code === 21608) {
    return {
      status: 400,
      message:
        "A Twilio trial account can only text numbers listed under Verified Caller IDs in the Twilio console.",
    };
  }

  const known = {
    60200: [400, "That phone number is not valid for SMS. Check the country code and the digits."],
    60202: [429, "Too many incorrect attempts. Request a new SMS code."],
    60203: [429, "Too many codes were sent to this number. Wait a few minutes and try again."],
    60212: [429, "A code was just sent. Wait a moment before requesting another."],
    60410: [403, "Twilio blocked this verification. Try again later or use another number."],
    60605: [400, "SMS verification is not enabled for this country on the Twilio account."],
    20003: [503, "Twilio rejected the account credentials. Check server/.env."],
    20403: [503, "Twilio refused this request. Check that the Verify service is active."],
  };

  if (code === 20404) {
    if (action === "check") {
      return {
        status: 400,
        message: "This code has expired, or no SMS verification is waiting. Request a new code.",
      };
    }
    return {
      status: 503,
      message: "Twilio could not find that Verify service. Check TWILIO_VERIFY_SERVICE_SID.",
    };
  }

  if (known[code]) {
    const [status, message] = known[code];
    return { status, message };
  }

  if (["ENOTFOUND", "ECONNRESET", "ETIMEDOUT", "EAI_AGAIN"].includes(code)) {
    return {
      status: 502,
      message: "Could not reach Twilio. Check the internet connection on this computer.",
    };
  }

  return {
    status: 502,
    message: "The SMS provider rejected the request. See the server window for the Twilio error.",
  };
}

app.get("/", (_req, res) => {
  res.json({
    name: "Phone OTP server",
    channel: "sms",
    endpoints: {
      health: "GET /api/health",
      send: "POST /api/send-otp { phone }",
      verify: "POST /api/verify-otp { phone, code }",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, channel: "sms", twilioConfigured: twilioConfigured() });
});

app.post("/api/send-otp", async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || "").trim();
    if (!isE164Phone(phone)) {
      return res.status(400).json({
        success: false,
        message: "Send the phone number in international format, like +923001234567.",
      });
    }
    if (!twilioConfigured()) {
      const error = new Error("Twilio Verify is not configured.");
      error.code = "MISSING_CONFIG";
      throw error;
    }
    if (!allow(sends, phone, 5, 10 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: "Too many SMS requests for this number. Wait a few minutes and try again.",
      });
    }

    const verification = await twilioClient()
      .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: "sms" });

    console.log(`SMS verification ${verification.status} for ${mask(phone)}`);
    return res.json({
      success: true,
      status: verification.status,
      message: "A 6-digit code was sent by SMS.",
    });
  } catch (error) {
    error.action = "send";
    return next(error);
  }
});

app.post("/api/verify-otp", async (req, res, next) => {
  try {
    const phone = String(req.body?.phone || "").trim();
    const code = String(req.body?.code || "").replace(/\D/g, "");
    if (!isE164Phone(phone)) {
      return res.status(400).json({
        success: false,
        message: "The phone number from the first step is missing or invalid.",
      });
    }
    if (!isSmsCode(code)) {
      return res.status(400).json({
        success: false,
        message: "Enter the 6-digit code from the SMS.",
      });
    }
    if (!twilioConfigured()) {
      const error = new Error("Twilio Verify is not configured.");
      error.code = "MISSING_CONFIG";
      throw error;
    }
    if (!allow(checks, phone, 10, 10 * 60 * 1000)) {
      return res.status(429).json({
        success: false,
        message: "Too many verification attempts. Request a new SMS code.",
      });
    }

    const check = await twilioClient()
      .verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({ to: phone, code });

    const approved = check.status === "approved";
    console.log(`SMS check ${check.status} for ${mask(phone)}`);
    return res.json({
      success: approved,
      status: check.status,
      message: approved
        ? "The SMS code matched. This phone number is verified."
        : "That code is incorrect. Check the SMS and try again.",
    });
  } catch (error) {
    error.action = "check";
    return next(error);
  }
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error?.type === "entity.parse.failed" || (error instanceof SyntaxError && "body" in error)) {
    return res.status(400).json({ success: false, message: "Request body must be JSON." });
  }
  console.error(`[${error.action || "request"}]`, error.code || "", error.message || error);
  const mapped = mapError(error, error.action);
  return res.status(mapped.status).json({ success: false, message: mapped.message });
});

function lanAddresses() {
  const addresses = [];
  for (const entries of Object.values(os.networkInterfaces())) {
    for (const entry of entries || []) {
      const family = entry.family;
      const ipv4 = family === "IPv4" || family === 4;
      if (ipv4 && !entry.internal) addresses.push(entry.address);
    }
  }
  return addresses;
}

app.listen(port, "0.0.0.0", () => {
  console.log("Phone OTP server (SMS via Twilio Verify)");
  console.log(`  Local:   http://localhost:${port}`);
  for (const address of lanAddresses()) {
    console.log(`  Network: http://${address}:${port}`);
  }
  console.log(
    twilioConfigured()
      ? "  Twilio:  configured"
      : "  Twilio:  missing keys — copy server/.env.example to server/.env",
  );
});
