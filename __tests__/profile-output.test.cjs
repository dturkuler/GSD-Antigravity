'use strict';
const path = require('path');
const profileOutputPath = path.join(__dirname, '../.agent/skills/gsd/bin/lib/profile-output.cjs');
const profileOutput = require(profileOutputPath);

describe('profile-output.cjs', () => {
  describe('cmdWriteProfile', () => {
    it('is exported as a function', () => {
      expect(typeof profileOutput.cmdWriteProfile).toBe('function');
    });
  });

  describe('cmdProfileQuestionnaire', () => {
    it('is exported as a function', () => {
      expect(typeof profileOutput.cmdProfileQuestionnaire).toBe('function');
    });
  });

  describe('cmdGenerateDevPreferences', () => {
    it('is exported as a function', () => {
      expect(typeof profileOutput.cmdGenerateDevPreferences).toBe('function');
    });
  });

  describe('PROFILING_QUESTIONS', () => {
    it('is exported as an array or object', () => {
      expect(profileOutput.PROFILING_QUESTIONS).toBeDefined();
    });
  });

  describe('ANTIGRAVITY_INSTRUCTIONS', () => {
    it('is exported as a string or object', () => {
      expect(profileOutput.ANTIGRAVITY_INSTRUCTIONS).toBeDefined();
    });
  });
});
