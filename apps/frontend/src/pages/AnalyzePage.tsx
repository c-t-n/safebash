import { useState } from 'react';
import { analyzeScript } from '../services/api';

function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const data = await analyzeScript(url);
      setResult(data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Analyze Bash Script</h2>
      <div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter script URL..."
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />
        <button onClick={handleAnalyze} disabled={loading || !url}>
          {loading ? 'Analyzing...' : 'Analyze Script'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '2rem' }}>
          <h3>Analysis Result</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default AnalyzePage;
