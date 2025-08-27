// Default to the local API during development; can be overridden via REACT_APP_API_BASE
const API_BASE =
  process.env.REACT_APP_API_BASE || 'http://localhost:5004';
export default API_BASE;
