const requiredEnvGroups = {
  razorpay: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  shiprocket: ['SHIPROCKET_EMAIL', 'SHIPROCKET_PASSWORD'],
};

function getMissingVars(groupName) {
  return requiredEnvGroups[groupName].filter((name) => !process.env[name]);
}

export function hasCredentials(groupName) {
  return getMissingVars(groupName).length === 0;
}

export function getMissingCredentials(groupName) {
  return getMissingVars(groupName);
}

export function buildCredentialError(groupName) {
  const missing = getMissingVars(groupName);
  return {
    message: `Missing ${groupName} credentials`,
    details: `Set the following environment variables: ${missing.join(', ')}`,
    missing,
  };
}

export function getApiConfigSummary() {
  return {
    port: Number(process.env.PORT || 8080),
    providers: {
      razorpayConfigured: hasCredentials('razorpay'),
      shiprocketConfigured: hasCredentials('shiprocket'),
    },
  };
}
