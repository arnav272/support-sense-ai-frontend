const config = {
  apiUrl: import.meta.env.PROD 
    ? 'https://support-sense-ai-backend.onrender.com'
    : 'http://localhost:8001'
}

export default config;