const baseRequiredVariables = ["MONGO_URI", "JWT_SECRET"];
const productionRequiredVariables = ["FRONTEND_URL_PROD", "PAYSTACK_SECRET_KEY", "SENDGRID_API_KEY", "SENDGRID_FROM"];

const isConfigured = (value) => {
  const normalized = String(value || "").trim();
  return normalized && !/(^|[/:@])your[-_]|replace_with|sk_(test|live)_replace|SG\.replace/i.test(normalized);
};

export const getMissingEnvironmentVariables = (env = process.env, nodeEnv = env.NODE_ENV || "development") => {
  const requiredVariables = [...baseRequiredVariables];

  if (nodeEnv === "production") {
    requiredVariables.push(...productionRequiredVariables);
  }

  return requiredVariables.filter((name) => !isConfigured(env[name]));
};

export const assertEnvironment = (env = process.env) => {
  const nodeEnv = env.NODE_ENV || "development";
  const missingVariables = getMissingEnvironmentVariables(env, nodeEnv);

  if (missingVariables.length) {
    throw new Error(`Missing required environment variables for ${nodeEnv}: ${missingVariables.join(", ")}`);
  }
};