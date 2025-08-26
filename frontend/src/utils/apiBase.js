// Default to the deployed API over HTTPS to avoid mixed-content issues
const API_BASE =
  process.env.REACT_APP_API_BASE || 'https://posterscoop-api.fly.dev';
export default API_BASE;
