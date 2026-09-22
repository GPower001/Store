import test from "node:test";
import assert from "node:assert/strict";
import { assertEnvironment, getMissingEnvironmentVariables } from "../config/environment.js";

test("development requires database and JWT configuration", () => {
  assert.deepEqual(
    getMissingEnvironmentVariables({ NODE_ENV: "development" }, "development"),
    ["MONGO_URI", "JWT_SECRET"],
  );
});

test("production also requires the production frontend URL", () => {
  assert.deepEqual(
    getMissingEnvironmentVariables({ NODE_ENV: "production", MONGO_URI: "mongodb://db", JWT_SECRET: "long-secret" }),
    ["FRONTEND_URL_PROD", "PAYSTACK_SECRET_KEY", "SENDGRID_API_KEY", "SENDGRID_FROM"],
  );
});

test("complete production configuration passes validation", () => {
  assert.doesNotThrow(() => assertEnvironment({
    NODE_ENV: "production",
    MONGO_URI: "mongodb://db",
    JWT_SECRET: "long-secret",
    FRONTEND_URL_PROD: "https://app.example.com",
    PAYSTACK_SECRET_KEY: "sk_live_real-secret",
    SENDGRID_API_KEY: "SG.real-key",
    SENDGRID_FROM: "no-reply@app.example.com",
  }));
});

test("blank secrets are treated as missing", () => {
  assert.throws(
    () => assertEnvironment({ NODE_ENV: "production", MONGO_URI: "mongodb://db", JWT_SECRET: "   ", FRONTEND_URL_PROD: "https://app.example.com" }),
    /JWT_SECRET/,
  );
});

test("production placeholders are treated as missing", () => {
  assert.deepEqual(
    getMissingEnvironmentVariables({
      NODE_ENV: "production",
      MONGO_URI: "your_mongodb_connection_string",
      JWT_SECRET: "replace_with_a_long_random_secret",
      FRONTEND_URL_PROD: "https://your-frontend-domain.example",
      PAYSTACK_SECRET_KEY: "sk_test_replace_with_paystack_secret",
      SENDGRID_API_KEY: "SG.replace_with_your_sendgrid_api_key",
      SENDGRID_FROM: "no-reply@your-verified-domain.example",
    }),
    ["MONGO_URI", "JWT_SECRET", "FRONTEND_URL_PROD", "PAYSTACK_SECRET_KEY", "SENDGRID_API_KEY", "SENDGRID_FROM"],
  );
});