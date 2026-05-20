import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createScript } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';

type InputMode = 'paste' | 'upload';

const DEFAULT_CONTENT = '#!/bin/bash\nset -e\n\n';

export default function ScriptCreatePage() {
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent]       = useState(DEFAULT_CONTENT);
  const [mode, setMode]             = useState<InputMode>('paste');
  const [fileName, setFileName]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const fileRef    = useRef<HTMLInputElement>(null);
  const { token }  = useAuth();
  const navigate   = useNavigate();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setContent(ev.target?.result as string);
    reader.readAsText(file);
  };

  const handleModeSwitch = (next: InputMode) => {
    setMode(next);
    if (next === 'paste' && content === DEFAULT_CONTENT) {
      setContent(DEFAULT_CONTENT);
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
      });
      navigate('/scripts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create script');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">new script</h1>
      </div>

      <form className="create-form" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-row">
          <label className="field-label" htmlFor="name">name</label>
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

        <div className="form-row">
          <label className="field-label" htmlFor="desc">
            description <span className="field-hint">optional</span>
          </label>
          <input
            id="desc"
            className="field-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="what does this script do?"
          />
        </div>

        <div className="form-row">
          <label className="field-label">content</label>

          <div className="mode-tabs">
            <button
              type="button"
              className={`mode-tab${mode === 'paste' ? ' active' : ''}`}
              onClick={() => handleModeSwitch('paste')}
            >
              paste
            </button>
            <button
              type="button"
              className={`mode-tab${mode === 'upload' ? ' active' : ''}`}
              onClick={() => handleModeSwitch('upload')}
            >
              upload .sh
            </button>
          </div>

          {mode === 'upload' ? (
            <div className="file-drop" onClick={() => fileRef.current?.click()}>
              <input
                ref={fileRef}
                type="file"
                accept=".sh,.bash"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              {fileName
                ? <span className="file-name">✓ {fileName}</span>
                : <span className="file-prompt">click to select a .sh file</span>}
            </div>
          ) : (
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
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'creating...' : 'create script'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => navigate('/scripts')}
          >
            cancel
          </button>
        </div>
      </form>
    </Layout>
  );
}
