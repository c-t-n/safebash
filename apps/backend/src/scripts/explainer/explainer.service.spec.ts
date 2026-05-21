import { Test, TestingModule } from '@nestjs/testing';
import { ExplainerService } from './explainer.service';
import { LlmExplainerClient } from './llm.client';

describe('ExplainerService', () => {
  let service: ExplainerService;
  let llm: jest.Mocked<LlmExplainerClient>;

  const buildModule = async (llmAvailable: boolean) => {
    const llmStub = {
      isAvailable: jest.fn().mockReturnValue(llmAvailable),
      summarise: jest.fn(),
      explainLines: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExplainerService,
        { provide: LlmExplainerClient, useValue: llmStub },
      ],
    }).compile();
    service = module.get(ExplainerService);
    llm = module.get(LlmExplainerClient) as unknown as jest.Mocked<LlmExplainerClient>;
  };

  describe('dictionary-only path (LLM disabled)', () => {
    beforeEach(async () => {
      await buildModule(false);
    });

    it('classifies known lines via the dictionary and marks unknown ones', async () => {
      const script = [
        '#!/bin/bash',
        'set -e',
        '# install the web server',
        '',
        'apt-get install -y nginx',
        'frobnicate the gizmo',
      ].join('\n');

      const result = await service.explain(script);

      expect(result.lines).toHaveLength(6);
      expect(result.lines[0].source).toBe('dict');       // shebang
      expect(result.lines[1].source).toBe('dict');       // set -e
      expect(result.lines[2].source).toBe('comment');
      expect(result.lines[3].source).toBe('empty');
      expect(result.lines[4].source).toBe('dict');       // apt install
      expect(result.lines[4].tech).toContain('nginx');
      expect(result.lines[5].source).toBe('unknown');
    });

    it('builds a templated summary from matched categories', async () => {
      const script = '#!/bin/bash\nset -e\napt-get install -y curl';
      const result = await service.explain(script);

      expect(result.summary.tech).toMatch(/bash entrypoint|strict mode|installs system packages/);
      expect(result.summary.plain).toMatch(/shell script|stop on errors|installs new software/);
      // LLM was never asked for a summary
      expect(llm.summarise).not.toHaveBeenCalled();
      expect(llm.explainLines).not.toHaveBeenCalled();
    });

    it('falls back to a no-recognition summary when nothing matches', async () => {
      const result = await service.explain('frobnicate the gizmo');
      expect(result.summary.tech).toMatch(/No recognised commands/);
    });

    it('folds backslash continuations into a single logical line', async () => {
      const script = [
        '#!/bin/bash',
        'apt-get install -y \\',
        '  nginx \\',
        '  curl',
        'echo done',
      ].join('\n');

      const result = await service.explain(script);

      // shebang, the folded apt-get block, echo
      expect(result.lines).toHaveLength(3);
      const apt = result.lines[1];
      expect(apt.lineNumber).toBe(2);
      expect(apt.endLineNumber).toBe(4);
      expect(apt.source).toBe('dict');
      // The first captured package name is what the dictionary template uses
      expect(apt.tech).toContain('nginx');
      expect(apt.content).toContain('\n'); // preserves original multi-line form
    });

    it('does not fold when the trailing backslash is escaped', async () => {
      const script = ['echo first\\\\', 'echo second'].join('\n');
      const result = await service.explain(script);
      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].endLineNumber).toBeUndefined();
    });

    it('collapses a multi-line if/fi block into a single explanation', async () => {
      const script = [
        '#!/bin/bash',
        'if [ -d /tmp ]; then',
        '  echo "yes"',
        '  echo "still yes"',
        'fi',
      ].join('\n');

      const result = await service.explain(script);

      // shebang + the block
      expect(result.lines).toHaveLength(2);
      const block = result.lines[1];
      expect(block.source).toBe('block');
      expect(block.lineNumber).toBe(2);
      expect(block.endLineNumber).toBe(5);
      expect(block.content.split('\n')).toHaveLength(4);
      expect(block.tech).toMatch(/Conditional block/);
      expect(block.plain).toMatch(/-d \/tmp/);
    });

    it('collapses a multi-line for/done block', async () => {
      const script = [
        'for f in *.sh; do',
        '  chmod +x "$f"',
        '  echo "$f"',
        'done',
      ].join('\n');

      const result = await service.explain(script);

      expect(result.lines).toHaveLength(1);
      const block = result.lines[0];
      expect(block.source).toBe('block');
      expect(block.lineNumber).toBe(1);
      expect(block.endLineNumber).toBe(4);
      expect(block.plain).toMatch(/every item/);
      expect(block.plain).toMatch(/f\)/);
    });

    it('collapses a case/esac block', async () => {
      const script = [
        'case "$1" in',
        '  start) echo on  ;;',
        '  stop)  echo off ;;',
        'esac',
      ].join('\n');

      const result = await service.explain(script);

      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].source).toBe('block');
      expect(result.lines[0].endLineNumber).toBe(4);
      expect(result.lines[0].tech).toMatch(/Multi-way branch/);
    });

    it('collapses a function block', async () => {
      const script = [
        'greet() {',
        '  echo "hi"',
        '}',
        'greet',
      ].join('\n');

      const result = await service.explain(script);

      // function block + the trailing call
      expect(result.lines).toHaveLength(2);
      const fn = result.lines[0];
      expect(fn.source).toBe('block');
      expect(fn.endLineNumber).toBe(3);
      expect(fn.tech).toContain('greet');
      expect(fn.blockKind).toBe('function');
      expect(fn.symbolName).toBe('greet');
    });

    it('exposes blockKind for non-function blocks but no symbolName', async () => {
      const script = ['for f in *; do', '  echo "$f"', 'done'].join('\n');
      const result = await service.explain(script);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].blockKind).toBe('for');
      expect(result.lines[0].symbolName).toBeUndefined();
    });

    it('still treats single-line if/fi as a regular dict match', async () => {
      const result = await service.explain('if [ -d /tmp ]; then echo yes; fi');
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].source).toBe('dict'); // not 'block'
    });

    it('nested blocks: outer block subsumes the inner one', async () => {
      const script = [
        'for f in *.sh; do',
        '  if [ -x "$f" ]; then',
        '    echo "$f"',
        '  fi',
        'done',
      ].join('\n');

      const result = await service.explain(script);

      expect(result.lines).toHaveLength(1);
      const block = result.lines[0];
      expect(block.source).toBe('block');
      expect(block.lineNumber).toBe(1);
      expect(block.endLineNumber).toBe(5);
      // The outer `for` describes it, not the inner `if`
      expect(block.tech).toMatch(/Iterates/);
    });

    it('degrades gracefully when a block is left unclosed', async () => {
      const script = [
        'if [ -d /tmp ]; then',
        '  echo "yes"',
      ].join('\n');

      const result = await service.explain(script);

      // No crash — falls back to per-line explanations.
      expect(result.lines.length).toBeGreaterThan(0);
      expect(result.lines.every((l) => l.source !== 'block')).toBe(true);
    });
  });

  describe('hybrid path (LLM available)', () => {
    beforeEach(async () => {
      await buildModule(true);
    });

    it('enriches unmatched lines and uses the LLM summary', async () => {
      llm.summarise.mockResolvedValue({ tech: 'LLM tech', plain: 'LLM plain' });
      llm.explainLines.mockResolvedValue([
        { lineNumber: 2, tech: 'LLM tech for line 2', plain: 'LLM plain for line 2' },
      ]);

      const script = '#!/bin/bash\nfrobnicate the gizmo';
      const result = await service.explain(script);

      expect(llm.summarise).toHaveBeenCalledTimes(1);
      expect(llm.explainLines).toHaveBeenCalledTimes(1);
      expect(llm.explainLines).toHaveBeenCalledWith([
        { lineNumber: 2, content: 'frobnicate the gizmo' },
      ]);

      expect(result.lines[0].source).toBe('dict');
      expect(result.lines[1]).toMatchObject({
        source: 'llm',
        tech: 'LLM tech for line 2',
        plain: 'LLM plain for line 2',
      });
      expect(result.summary).toEqual({ tech: 'LLM tech', plain: 'LLM plain' });
    });

    it('does not call explainLines when nothing is unmatched', async () => {
      llm.summarise.mockResolvedValue({ tech: 'all clear', plain: 'all clear' });

      const script = '#!/bin/bash\nset -e';
      await service.explain(script);

      expect(llm.explainLines).not.toHaveBeenCalled();
      expect(llm.summarise).toHaveBeenCalledTimes(1);
    });

    it('falls back to templated summary when summarise returns null', async () => {
      llm.summarise.mockResolvedValue(null);
      llm.explainLines.mockResolvedValue(null);

      const script = '#!/bin/bash\nfrobnicate';
      const result = await service.explain(script);

      // Templated summary built from the shebang category
      expect(result.summary.tech).toMatch(/bash entrypoint/);
      // Unmatched line stays as 'unknown' when LLM enrichment fails
      expect(result.lines[1].source).toBe('unknown');
    });
  });
});
