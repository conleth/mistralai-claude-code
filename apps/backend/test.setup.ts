/**
 * Test setup file
 */

import { vi } from 'vitest';
import { execSync } from 'child_process';

// Mock child_process.execSync for database operations
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

// Mock fs for test database
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
    unlinkSync: vi.fn(),
    mkdirSync: vi.fn(),
    readFileSync: actual.readFileSync,
  };
});

// Mock path
vi.mock('path', async () => {
  const actual = await vi.importActual('path');
  return {
    ...actual,
    join: actual.join,
    basename: actual.basename,
    dirname: actual.dirname,
  };
});

console.log('Test setup complete');
