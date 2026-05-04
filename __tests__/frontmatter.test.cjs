'use strict';
const path = require('path');
const fs = require('fs');

const frontmatterPath = path.join(__dirname, '../.agent/skills/gsd/bin/lib/frontmatter.cjs');
const { extractFrontmatter } = require(frontmatterPath);

const FIXTURE_PATH = path.join(__dirname, 'fixtures', 'sample-frontmatter.md');

describe('frontmatter.cjs', () => {
  describe('extractFrontmatter()', () => {
    it('extracts YAML frontmatter from fixture file', () => {
      const content = fs.readFileSync(FIXTURE_PATH, 'utf-8');
      const result = extractFrontmatter(content);

      // The function extracts the frontmatter into an object.
      // Unlike what Plan 02 expected, `extractFrontmatter` only returns the frontmatter data, not `{ data, content }` based on reading the source code.
      expect(result).toHaveProperty('name', 'test-command');
      expect(result).toHaveProperty('description');
    });

    it('returns empty data for content with no frontmatter', () => {
      const result = extractFrontmatter('# No Frontmatter\n\nJust body text');
      expect(result).toEqual({});
    });

    it('handles empty frontmatter block', () => {
      const result = extractFrontmatter('---\n---\nBody here');
      expect(result).toEqual({});
    });
  });
});
