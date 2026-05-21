import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Download, Upload } from 'lucide-react';
import { createScript, fetchScriptFromUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';

type InputMode = 'paste' | 'upload' | 'url';

const DEFAULT_CONTENT = '#!/bin/bash\nset -e\n\n';

export default function ScriptCreatePage() {
  const [name, setName]               = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent]         = useState(DEFAULT_CONTENT);
  const [mode, setMode]               = useState<InputMode>('paste');
  const [fileName, setFileName]       = useState<string | null>(null);
  const [sourceUrl, setSourceUrl]     = useState('');
  const [fetchedUrl, setFetchedUrl]   = useState<string | null>(null);
  const [fetching, setFetching]       = useState(false);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const fileRef   = useRef<HTMLInputElement>(null);
  const { token } = useAuth();
  const navigate  = useNavigate();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleFetch = async () => {
    if (!token || !sourceUrl.trim()) return;
    setFetchError(null);
    setFetching(true);
    try {
      const res = await fetchScriptFromUrl(token, sourceUrl.trim());
      setContent(res.content);
      setFetchedUrl(res.url);
      if (!name && res.suggestedName) setName(res.suggestedName);
    } catch (err: unknown) {
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch URL');
      setFetchedUrl(null);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    try {
      await createScript(token, {
        name,
        content,
        ...(description.trim() ? { description: description.trim() } : {}),
        // Persist the source URL when the user fetched from one.
        ...(mode === 'url' && fetchedUrl ? { url: fetchedUrl } : {}),
      });
      navigate('/scripts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create script');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !loading && content.trim().length > 0 && name.trim().length > 0;
  const fetchedLineCount = fetchedUrl ? content.split('\n').length : 0;

  return (
    <Layout>
      <div className="page-head">
        <div>
          <h1 className="page-title">Publish a script</h1>
          <p className="page-subtitle">
            Upload, paste, or pull a bash script from an existing URL. SafeBash hashes,
            audits, and serves it at a stable URL.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: 22, maxWidth: 760 }}>
        <form className="form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field">
            <label className="field-label" htmlFor="name">Name</label>
            <input
              id="name"
              className="field-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-install-script"
              autoFocus
              required
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="desc">
              Description <span className="field-hint">— optional</span>
            </label>
            <input
              id="desc"
              className="field-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this script do?"
            />
          </div>

          <div className="field">
            <span className="field-label">Content</span>
            <div className="mode-tabs">
              <button
                type="button"
                className={`mode-tab${mode === 'paste' ? ' active' : ''}`}
                onClick={() => setMode('paste')}
              >
                Paste
              </button>
              <button
                type="button"
                className={`mode-tab${mode === 'upload' ? ' active' : ''}`}
                onClick={() => setMode('upload')}
              >
                Upload .sh
              </button>
              <button
                type="button"
                className={`mode-tab${mode === 'url' ? ' active' : ''}`}
                onClick={() => setMode('url')}
              >
                From URL
              </button>
            </div>

            {mode === 'upload' && (
              <div className="file-drop" onClick={() => fileRef.current?.click()}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".sh,.bash"
                  onChange={handleFile}
                  style={{ display: 'none' }}
                />
                {fileName ? (
                  <span className="file-name">✓ {fileName}</span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <Upload size={14} /> click to select a .sh file
                  </span>
                )}
              </div>
            )}

            {mode === 'url' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="url"
                    className="field-input"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://install.example.com/setup.sh"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleFetch();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn"
                    onClick={handleFetch}
                    disabled={fetching || !sourceUrl.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    <Download size={13} /> {fetching ? 'Fetching…' : 'Fetch'}
                  </button>
                </div>
                {fetchError && <div className="form-error">{fetchError}</div>}
                {fetchedUrl && !fetchError && (
                  <div className="pill pill--good" style={{ alignSelf: 'flex-start' }}>
                    <Check size={11} strokeWidth={2.5} />
                    Fetched {fetchedLineCount} lines from{' '}
                    <span className="mono">{fetchedUrl}</span>
                  </div>
                )}
                <textarea
                  className="field-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  spellCheck={false}
                  placeholder="(content will appear here after Fetch — you can still edit it before publishing)"
                  required
                />
              </div>
            )}

            {mode === 'paste' && (
              <textarea
                className="field-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                required
              />
            )}
          </div>

          <div className="form-actions">
            <button className="btn btn--ink" type="submit" disabled={!canSubmit}>
              {loading ? 'Publishing…' : 'Publish script'}
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => navigate('/scripts')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
