const fs = require('fs');
const path = require('path');

describe('snapshot', () => {
  let snapshotModule;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'readdirSync').mockReturnValue([]);

    const originalReadFileSync = fs.readFileSync;
    jest.spyOn(fs, 'readFileSync').mockImplementation((filepath, options) => {
      if (typeof filepath === 'string' && filepath.includes('config.json')) {
        return '';
      }
      if (typeof filepath === 'string' && filepath.includes('state-')) {
        return '';
      }
      return originalReadFileSync(filepath, options);
    });

    jest.spyOn(fs, 'unlinkSync').mockImplementation(() => {});
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    snapshotModule = require('../.agent/skills/gsd/bin/lib/snapshot.cjs');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createSnapshot', () => {
    it('writes a JSON file to .planning/snapshots/ with correct filename format', () => {
      const stateData = { status: 'executing' };
      const cwd = '/mock/cwd';
      fs.readdirSync.mockReturnValue([]);

      const result = snapshotModule.createSnapshot(cwd, stateData, { trigger: 'test', phase: '2' });

      expect(fs.mkdirSync).toHaveBeenCalledWith(path.join(cwd, '.planning', 'snapshots'), {
        recursive: true,
      });
      expect(fs.writeFileSync).toHaveBeenCalled();

      const writeCall = fs.writeFileSync.mock.calls[0];
      expect(writeCall[0]).toMatch(/state-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);

      const writtenData = JSON.parse(writeCall[1]);
      expect(writtenData.snapshot_version).toBe('1.0');
      expect(writtenData.trigger).toBe('test');
      expect(writtenData.phase).toBe('2');
      expect(writtenData.state).toEqual(stateData);

      expect(result).toHaveProperty('path');
      expect(result).toHaveProperty('timestamp');
    });

    it('prunes old snapshots when count exceeds maxCount', () => {
      const cwd = '/mock/cwd';
      fs.existsSync.mockReturnValue(true);
      // Simulate config exists with maxCount = 2
      fs.readFileSync.mockImplementation((filepath) => {
        if (filepath.endsWith('config.json')) return JSON.stringify({ snapshots: { maxCount: 2 } });
        return '';
      });
      // Simulate 3 existing snapshots
      fs.readdirSync.mockReturnValue([
        'state-2026-05-01T10-00-00.json',
        'state-2026-05-02T10-00-00.json',
        'state-2026-05-03T10-00-00.json',
      ]);

      snapshotModule.createSnapshot(cwd, {}, {});

      // Should delete the oldest one
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        path.join(cwd, '.planning', 'snapshots', 'state-2026-05-01T10-00-00.json')
      );
    });
  });

  describe('loadSnapshots', () => {
    it('returns empty array when no snapshots directory exists', () => {
      fs.existsSync.mockReturnValue(false);
      const results = snapshotModule.loadSnapshots('/mock/cwd');
      expect(results).toEqual([]);
    });

    it('returns array sorted newest-first and parses JSON', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([
        'state-2026-05-01T10-00-00.json',
        'state-2026-05-03T10-00-00.json',
        'state-2026-05-02T10-00-00.json',
        'not-a-snapshot.txt',
      ]);

      fs.readFileSync.mockImplementation((filepath) => {
        if (filepath.includes('2026-05-01')) return JSON.stringify({ state: { id: 1 } });
        if (filepath.includes('2026-05-02')) return JSON.stringify({ state: { id: 2 } });
        if (filepath.includes('2026-05-03')) return JSON.stringify({ state: { id: 3 } });
        return '';
      });

      const results = snapshotModule.loadSnapshots('/mock/cwd');

      expect(results).toHaveLength(3);
      // Newest first: 03, 02, 01
      expect(results[0].data.state.id).toBe(3);
      expect(results[1].data.state.id).toBe(2);
      expect(results[2].data.state.id).toBe(1);
    });

    it('handles malformed JSON files gracefully', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['state-2026-05-01T10-00-00.json']);
      fs.readFileSync.mockReturnValue('INVALID JSON');

      const results = snapshotModule.loadSnapshots('/mock/cwd');
      expect(results).toEqual([]);
    });

    it('respects limit parameter', () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue([
        'state-2026-05-01T10-00-00.json',
        'state-2026-05-02T10-00-00.json',
      ]);
      fs.readFileSync.mockReturnValue('{}');

      const results = snapshotModule.loadSnapshots('/mock/cwd', 1);
      expect(results).toHaveLength(1);
      expect(results[0].path).toContain('2026-05-02'); // Newer
    });
  });

  describe('diffSnapshots', () => {
    it('returns empty changes when states are identical', () => {
      const state = { status: 'executing', current_plan: '1' };
      const diff = snapshotModule.diffSnapshots(state, state);
      expect(diff.changes).toEqual([]);
      expect(diff.added).toEqual([]);
      expect(diff.removed).toEqual([]);
    });

    it('detects changed fields', () => {
      const older = { status: 'executing', current_plan: '1', decisions: [{}] };
      const newer = { status: 'verifying', current_plan: '1', decisions: [{}, {}] };

      const diff = snapshotModule.diffSnapshots(older, newer);
      expect(diff.changes).toContainEqual({ field: 'status', from: 'executing', to: 'verifying' });
      expect(diff.changes).toContainEqual({ field: 'decisions.length', from: 1, to: 2 });
    });

    it('detects added and removed fields (null transitions)', () => {
      const older = { status: 'executing', paused_at: '2026-05-01', new_field: null };
      const newer = { status: 'executing', paused_at: null, new_field: 'value' };

      const diff = snapshotModule.diffSnapshots(older, newer);
      expect(diff.removed).toContain('paused_at');
      expect(diff.added).toContain('new_field');
    });

    it('handles undefined or missing states gracefully', () => {
      const diff = snapshotModule.diffSnapshots(null, null);
      expect(diff.changes).toEqual([]);

      const diff2 = snapshotModule.diffSnapshots({ status: 'executing' }, null);
      expect(diff2.removed.length).toBeGreaterThan(0);
    });
  });

  describe('renderDiffSummary', () => {
    it('returns markdown table with changes', () => {
      const diff = {
        changes: [{ field: 'status', from: 'executing', to: 'verifying' }],
        added: ['new_field'],
        removed: ['old_field'],
      };

      const md = snapshotModule.renderDiffSummary(diff);
      expect(md).toContain('| Field');
      expect(md).toContain('| status');
      expect(md).toContain('executing');
      expect(md).toContain('verifying');
      expect(md).toContain('**Added:** new_field');
      expect(md).toContain('**Removed:** old_field');
    });

    it('returns "No changes detected" when diff is empty', () => {
      const diff = { changes: [], added: [], removed: [] };
      const md = snapshotModule.renderDiffSummary(diff);
      expect(md).toBe('No changes detected.');
    });
  });
});
