'use strict';
const path = require('path');
const verifyPath = path.join(__dirname, '../.agent/skills/gsd/bin/lib/verify.cjs');
const verify = require(verifyPath);

describe('verify.cjs', () => {
  describe('cmdVerifySummary', () => {
    it('is exported as a function', () => {
      expect(typeof verify.cmdVerifySummary).toBe('function');
    });
  });

  describe('cmdVerifyPlanStructure', () => {
    it('is exported as a function', () => {
      expect(typeof verify.cmdVerifyPlanStructure).toBe('function');
    });
  });

  describe('cmdVerifyPhaseCompleteness', () => {
    it('is exported as a function', () => {
      expect(typeof verify.cmdVerifyPhaseCompleteness).toBe('function');
    });
  });

  describe('cmdVerifyReferences', () => {
    it('is exported as a function', () => {
      expect(typeof verify.cmdVerifyReferences).toBe('function');
    });
  });

  describe('cmdVerifyArtifacts', () => {
    it('is exported as a function', () => {
      expect(typeof verify.cmdVerifyArtifacts).toBe('function');
    });
  });
});
