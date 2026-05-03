'use strict';

const fs = require('fs');
const path = require('path');

describe('analytics', () => {
  let analyticsModule;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});

    // For isEnabled, loadAnalytics, recordPhaseRun
    const originalReadFileSync = fs.readFileSync;
    jest.spyOn(fs, 'readFileSync').mockImplementation((filepath, options) => {
      // Mock for config.json and analytics.json by default to simulate non-existence or specific content
      // Individual tests will override this
      if (typeof filepath === 'string') {
        if (filepath.includes('config.json') || filepath.includes('analytics.json')) {
          const error = new Error('ENOENT: no such file or directory');
          error.code = 'ENOENT';
          throw error;
        }
      }
      return originalReadFileSync(filepath, options);
    });

    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    analyticsModule = require('../.agent/skills/gsd/bin/lib/analytics.cjs');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('recordPhaseRun', () => {
    it('creates analytics.json if it doesnt exist', () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('analytics.json')) {
          const error = new Error('ENOENT');
          error.code = 'ENOENT';
          throw error;
        }
        return '';
      });

      const entry = { phase: '1', timestamp: '2026-05-03T00:00:00.000Z', duration_ms: 1000, plan_count: 1, error_count: 0 };
      const res = analyticsModule.recordPhaseRun('/test', entry);
      
      expect(res.recorded).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalled();
      const writeArgs = fs.writeFileSync.mock.calls[0];
      expect(writeArgs[0]).toContain('analytics.json');
      const writtenData = JSON.parse(writeArgs[1]);
      expect(writtenData.analytics_version).toBe('1.0');
      expect(writtenData.entries.length).toBe(1);
      expect(writtenData.entries[0]).toEqual(entry);
    });

    it('appends entry to existing analytics.json', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('analytics.json')) {
          return JSON.stringify({
            analytics_version: '1.0',
            entries: [{ phase: '1', duration_ms: 500 }]
          });
        }
        return '';
      });

      const entry = { phase: '2', duration_ms: 2000 };
      analyticsModule.recordPhaseRun('/test', entry);
      
      const writeArgs = fs.writeFileSync.mock.calls[0];
      const writtenData = JSON.parse(writeArgs[1]);
      expect(writtenData.entries.length).toBe(2);
      expect(writtenData.entries[1]).toEqual(expect.objectContaining(entry));
    });
  });

  describe('loadAnalytics', () => {
    it('returns empty structure when analytics.json doesnt exist', () => {
      const res = analyticsModule.loadAnalytics('/test');
      expect(res.entries).toEqual([]);
      expect(res.summary.totalRuns).toBe(0);
      expect(res.summary.avgDuration).toBe(0);
      expect(res.summary.errorRate).toBe(0);
    });

    it('returns entries array and computed summary', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('analytics.json')) {
          return JSON.stringify({
            entries: [
              { duration_ms: 1000, error_count: 1 },
              { duration_ms: 3000, error_count: 0 }
            ]
          });
        }
        return '';
      });

      const res = analyticsModule.loadAnalytics('/test');
      expect(res.entries.length).toBe(2);
      expect(res.summary.totalRuns).toBe(2);
      expect(res.summary.avgDuration).toBe(2000);
      expect(res.summary.errorRate).toBe(50); // 1 error out of 2 runs = 50%
    });

    it('handles malformed JSON gracefully', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('analytics.json')) {
          return 'invalid json';
        }
        return '';
      });

      const res = analyticsModule.loadAnalytics('/test');
      expect(res.entries).toEqual([]);
      expect(res.summary.totalRuns).toBe(0);
    });
  });

  describe('isEnabled', () => {
    it('returns true when config.json doesnt exist (default enabled)', () => {
      expect(analyticsModule.isEnabled('/test')).toBe(true);
    });

    it('returns true when analytics key is missing from config', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('config.json')) return JSON.stringify({ some: 'config' });
        return '';
      });
      expect(analyticsModule.isEnabled('/test')).toBe(true);
    });

    it('returns false when analytics.enabled is false', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('config.json')) return JSON.stringify({ analytics: { enabled: false } });
        return '';
      });
      expect(analyticsModule.isEnabled('/test')).toBe(false);
    });

    it('returns true when analytics.enabled is true', () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      jest.spyOn(fs, 'readFileSync').mockImplementation((filepath) => {
        if (filepath.includes('config.json')) return JSON.stringify({ analytics: { enabled: true } });
        return '';
      });
      expect(analyticsModule.isEnabled('/test')).toBe(true);
    });
  });

  describe('renderDashboard', () => {
    it('returns minimal dashboard when no analytics data', () => {
      const data = { entries: [], summary: { totalRuns: 0, avgDuration: 0, errorRate: 0 } };
      const dash = analyticsModule.renderDashboard(data, 'No changes');
      expect(dash).toContain('GSD Health Dashboard');
      expect(dash).toContain('No analytics data collected yet');
      expect(dash).toContain('No changes');
    });

    it('returns ASCII string containing progress bar and recent runs', () => {
      const data = { 
        entries: [
          { phase: '1', duration_ms: 15000, plan_count: 2, error_count: 0 },
          { phase: '2', duration_ms: 8200, plan_count: 1, error_count: 0 }
        ], 
        summary: { totalRuns: 2, avgDuration: 11600, errorRate: 0 },
        // Simulate total_phases provided externally via state or something, 
        // but for now the test will just check what renderDashboard outputs 
        // assuming it handles state info internally or accepts it
      };
      
      const dash = analyticsModule.renderDashboard(data, 'Delta changes');
      expect(dash).toContain('GSD Health Dashboard');
      expect(dash).toContain('Phase 1: 15.0s');
      expect(dash).toContain('Phase 2: 8.2s');
      expect(dash).toContain('Error Rate: 0.0%');
      expect(dash).toContain('Delta changes');
    });
  });
});
