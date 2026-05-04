'use strict';
const path = require('path');

// Mock fs before requiring the module (per D-03)
jest.mock('fs');
const fs = require('fs');

const corePath = path.join(__dirname, '../.agent/skills/gsd/bin/lib/core.cjs');
// Read core.cjs exports — adapt requires to actual exported names
const core = require(corePath);

describe('core.cjs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseIncludeFlag', () => {
    it('returns a Set containing comma-separated values', () => {
      const args = ['some-cmd', '--include', 'state,roadmap'];
      const result = core.parseIncludeFlag(args);
      expect(result).toBeInstanceOf(Set);
      expect(result.has('state')).toBe(true);
      expect(result.has('roadmap')).toBe(true);
    });

    it('returns an empty Set when --include flag is absent', () => {
      const args = ['some-cmd', '--other-flag'];
      const result = core.parseIncludeFlag(args);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });

    it('returns an empty Set when --include value is empty', () => {
      const args = ['some-cmd', '--include'];
      const result = core.parseIncludeFlag(args);
      expect(result).toBeInstanceOf(Set);
      expect(result.size).toBe(0);
    });
  });

  describe('findProjectRoot', () => {
    it('returns directory containing .planning/ when present', () => {
      // Mock fs.existsSync to return true only for a specific .planning/ path
      fs.existsSync.mockImplementation((p) => p.includes('.planning'));
      // Mock statSync to say it's a directory
      fs.statSync.mockReturnValue({ isDirectory: () => true });

      const startDir = '/some/project/path';
      const result = core.findProjectRoot(startDir);

      // Because we mocked it such that every .planning exists, it should find it at startDir immediately.
      expect(result).toBe(startDir);
    });
  });

  describe('toPosixPath', () => {
    it('normalizes Windows backslashes to forward slashes', () => {
      const winPath = 'some\\path\\with\\slashes';
      const result = core.toPosixPath(winPath);
      expect(result).toBe('some/path/with/slashes');
    });

    it('leaves forward slashes intact', () => {
      const posixPath = 'some/path/with/slashes';
      const result = core.toPosixPath(posixPath);
      expect(result).toBe('some/path/with/slashes');
    });
  });

  describe('isGitIgnored', () => {
    it('is exported as a function', () => {
      expect(typeof core.isGitIgnored).toBe('function');
    });
  });

  describe('normalizeMd', () => {
    it('is exported as a function', () => {
      expect(typeof core.normalizeMd).toBe('function');
    });
  });
});
