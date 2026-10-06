import { describe, expect, it } from 'vitest';
import { generateLlmsTxt } from '@/lib/llms';

describe('generateLlmsTxt', () => {
  it('generates markdown containing key profile sections', async () => {
    const text = await generateLlmsTxt('https://test.example.com');

    expect(text).toContain('# Yonatan Mekete (YONATANE M)');
    expect(text).toContain('## Summary');
    expect(text).toContain('## Projects');
    expect(text).toContain('Shipyard');
    expect(text).toContain('## Experience');
    expect(text).toContain('## Technical Stack');
    expect(text).toContain('TypeScript');
    expect(text).toContain('## Contact & Profiles');
    expect(text).toContain('https://test.example.com');
  });
});
