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
    existsSync: vi.fn(() => false),
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

// Mock sqlite3 to prevent database initialization
vi.mock('sqlite3', () => {
  return {
    Database: class MockDatabase {
      static open() {
        return Promise.resolve({
          close: vi.fn(),
          exec: vi.fn(),
          get: vi.fn(),
          all: vi.fn(),
          run: vi.fn(),
        });
      }
    },
    OPEN_READWRITE: 1,
    OPEN_CREATE: 2,
  };
});

// Mock sqlite to prevent database initialization
vi.mock('sqlite', async () => {
  const actual = await vi.importActual('sqlite');
  return {
    ...actual,
    open: vi.fn(() => Promise.resolve({
      close: vi.fn(),
      exec: vi.fn(),
      get: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
    })),
  };
});

console.log('Test setup complete');
