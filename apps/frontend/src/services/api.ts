const API_BASE_URL = '/api';

export async function analyzeScript(url: string) {
  const response = await fetch(`${API_BASE_URL}/scripts/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze script');
  }

  return response.json();
}

export async function getScripts() {
  const response = await fetch(`${API_BASE_URL}/scripts`);

  if (!response.ok) {
    throw new Error('Failed to fetch scripts');
  }

  return response.json();
}
