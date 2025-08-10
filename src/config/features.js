export const features = {
  GEMINI_QUOTA_ROUTING: process.env.REACT_APP_GEMINI_QUOTA_ROUTING === 'true' || true, // Default enabled
  GEMINI_CACHING: process.env.REACT_APP_GEMINI_CACHING === 'true' || true,
  GEMINI_SMART_MODEL_SELECTION: process.env.REACT_APP_GEMINI_SMART_SELECTION === 'true' || true,
};
