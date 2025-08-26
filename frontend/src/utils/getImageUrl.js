import API_BASE from './apiBase';

export default async function getImageUrl(key) {
  const res = await fetch(`${API_BASE}/api/image/${key}`);
  if (!res.ok) {
    throw new Error('Failed to fetch image URL');
  }
  const data = await res.json();
  return data.url;
}
