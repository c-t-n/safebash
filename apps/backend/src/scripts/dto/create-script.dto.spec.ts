import { validate } from 'class-validator';
import { CreateScriptDto } from './create-script.dto';

const valid = (content: string) => Object.assign(new CreateScriptDto(), { name: 'x', content });

describe('CreateScriptDto – bash shebang validation', () => {
  const accepted = [
    '#!/bin/bash\necho hi',
    '#!/bin/sh\necho hi',
    '#!/usr/bin/bash\necho hi',
    '#!/usr/bin/sh\necho hi',
    '#!/usr/bin/env bash\necho hi',
    '#!/usr/bin/env sh\necho hi',
    '#!/usr/local/bin/bash\necho hi',
    '#!/bin/bash -e\necho hi',
  ];

  const rejected = [
    'echo no shebang',
    '#!/usr/bin/python3\nprint("hi")',
    '#!/usr/bin/node\nconsole.log("hi")',
    '# comment first\n#!/bin/bash',
    '',
  ];

  it.each(accepted)('accepts: %s', async (content) => {
    const errors = await validate(valid(content));
    const contentErrors = errors.filter((e) => e.property === 'content');
    expect(contentErrors).toHaveLength(0);
  });

  it.each(rejected)('rejects: %s', async (content) => {
    const errors = await validate(valid(content));
    const contentErrors = errors.filter((e) => e.property === 'content');
    expect(contentErrors.length).toBeGreaterThan(0);
  });
});
