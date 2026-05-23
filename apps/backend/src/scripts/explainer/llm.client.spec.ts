import { LlmExplainerClient } from './llm.client';

const originalFetch = globalThis.fetch;
const originalUrl   = process.env.OLLAMA_URL;
const originalModel = process.env.OLLAMA_MODEL;

function mockOkOnce(body: unknown) {
  const fetchMock = jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => body,
  });
  (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

afterEach(() => {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch;
  if (originalUrl   === undefined) delete process.env.OLLAMA_URL;   else process.env.OLLAMA_URL = originalUrl;
  if (originalModel === undefined) delete process.env.OLLAMA_MODEL; else process.env.OLLAMA_MODEL = originalModel;
});

describe('LlmExplainerClient (Ollama)', () => {
  describe('isAvailable', () => {
    it('is true when OLLAMA_URL is set', () => {
      process.env.OLLAMA_URL = 'http://ollama:11434';
      expect(new LlmExplainerClient().isAvailable()).toBe(true);
    });

    it('is false when OLLAMA_URL is empty', () => {
      process.env.OLLAMA_URL = '';
      expect(new LlmExplainerClient().isAvailable()).toBe(false);
    });
  });

  describe('summarise', () => {
    beforeEach(() => {
      process.env.OLLAMA_URL   = 'http://ollama:11434';
      process.env.OLLAMA_MODEL = 'qwen2.5:3b';
    });

    it('POSTs to /api/chat with format=json and parses the response', async () => {
      const fetchMock = mockOkOnce({
        message: { content: JSON.stringify({ tech: 'TECH', plain: 'PLAIN' }) },
      });
      const result = await new LlmExplainerClient().summarise('#!/bin/bash');
      expect(result).toEqual({ tech: 'TECH', plain: 'PLAIN' });
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('http://ollama:11434/api/chat');
      const body = JSON.parse((init as RequestInit).body as string);
      expect(body).toMatchObject({ model: 'qwen2.5:3b', format: 'json', stream: false });
      expect(body.messages).toHaveLength(2);
    });

    it('returns null when the response is not JSON-of-the-right-shape', async () => {
      mockOkOnce({ message: { content: '{"tech": 1, "plain": 2}' } });
      expect(await new LlmExplainerClient().summarise('x')).toBeNull();
    });

    it('returns null on non-200', async () => {
      (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500 }) as unknown as typeof fetch;
      expect(await new LlmExplainerClient().summarise('x')).toBeNull();
    });

    it('returns null when fetch rejects', async () => {
      (globalThis as unknown as { fetch: typeof fetch }).fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error('connect ECONNREFUSED')) as unknown as typeof fetch;
      expect(await new LlmExplainerClient().summarise('x')).toBeNull();
    });

    it('returns null without calling fetch when disabled', async () => {
      process.env.OLLAMA_URL = '';
      const fetchMock = jest.fn();
      (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
      expect(await new LlmExplainerClient().summarise('x')).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('explainLines', () => {
    beforeEach(() => {
      process.env.OLLAMA_URL   = 'http://ollama:11434';
      process.env.OLLAMA_MODEL = 'qwen2.5:3b';
    });

    it('makes one batched call and drops malformed entries', async () => {
      const fetchMock = mockOkOnce({
        message: {
          content: JSON.stringify({
            lines: [
              { lineNumber: 1, tech: 'A', plain: 'a' },
              { lineNumber: 2, tech: 'B', plain: 'b' },
              { lineNumber: 3, tech: 42, plain: 'bad' },        // wrong type
              { lineNumber: 'x', tech: 'C', plain: 'c' },        // wrong type
              { lineNumber: 4, tech: 'D' },                       // missing plain
            ],
          }),
        },
      });
      const result = await new LlmExplainerClient().explainLines([
        { lineNumber: 1, content: 'a' },
        { lineNumber: 2, content: 'b' },
        { lineNumber: 3, content: 'c' },
        { lineNumber: 4, content: 'd' },
      ]);
      expect(result).toEqual([
        { lineNumber: 1, tech: 'A', plain: 'a' },
        { lineNumber: 2, tech: 'B', plain: 'b' },
      ]);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('returns null without calling fetch when the input is empty', async () => {
      const fetchMock = jest.fn();
      (globalThis as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
      expect(await new LlmExplainerClient().explainLines([])).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
