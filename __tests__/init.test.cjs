'use strict';
const path = require('path');
const fs = require('fs');

// Mock fs and core.cjs (partially) if needed, but since we want to avoid deep mocking
// that breaks the tests, we can just test the exported functions that don't do complex I/O,
// or use jest.spyOn for fs methods.

const initPath = path.join(__dirname, '../.agent/skills/gsd/bin/lib/init.cjs');
const init = require(initPath);

describe('init.cjs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('detectChildRepos', () => {
    it('is exported as a function', () => {
      expect(typeof init.detectChildRepos).toBe('function');
    });
  });

  describe('buildAgentSkillsBlock', () => {
    it('is exported as a function', () => {
      expect(typeof init.buildAgentSkillsBlock).toBe('function');
    });
  });

  describe('cmdInitExecutePhase', () => {
    it('is exported as a function', () => {
      expect(typeof init.cmdInitExecutePhase).toBe('function');
    });
  });

  describe('cmdInitPhaseOp', () => {
    it('is exported as a function', () => {
      expect(typeof init.cmdInitPhaseOp).toBe('function');
    });
  });

  describe('cmdInitPlanPhase', () => {
    it('is exported as a function', () => {
      expect(typeof init.cmdInitPlanPhase).toBe('function');
    });
  });
});
