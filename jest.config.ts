import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@izerp-plugin/(.*)$': '<rootDir>/packages/izerp-plugin/$1',
    '^@izerp-theme/(.*)$': '<rootDir>/packages/izerp-theme/$1',
    '^jose$': require.resolve('jose'),
    // Stub CSS/SCSS imports in unit tests
    '\\.(css|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
  },
  projects: [
    {
      // Unit tests — React components need jsdom + jest-dom
      displayName: 'unit',
      testEnvironment: 'jsdom',
      preset: 'ts-jest',
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
            moduleResolution: 'node',
            allowJs: true,
          },
        }],
      },
      transformIgnorePatterns: [
        'node_modules/(?!(jose)/)'
      ],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@izerp-plugin/(.*)$': '<rootDir>/packages/izerp-plugin/$1',
        '^@izerp-theme/(.*)$': '<rootDir>/packages/izerp-theme/$1',
        '^jose$': require.resolve('jose'),
        '\\.(css|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
        '^next/server$': '<rootDir>/tests/__mocks__/next-server.ts',
        // Mock jwt to isolate hasPermission() from transitive jwt/jose imports
        '^@/core/engine/auth/jwt$': '<rootDir>/tests/__mocks__/jwt.ts',
        '^.*/engine/auth/jwt$': '<rootDir>/tests/__mocks__/jwt.ts',
      },
      testMatch: ['**/tests/unit/**/*.test.{ts,tsx}'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
    {
      // Contract + integration tests — pure Node, no DOM
      displayName: 'contracts',
      testEnvironment: 'node',
      preset: 'ts-jest',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@izerp-plugin/(.*)$': '<rootDir>/packages/izerp-plugin/$1',
        '^@izerp-theme/(.*)$': '<rootDir>/packages/izerp-theme/$1',
        '^jose$': require.resolve('jose'),
      },
      testMatch: [
        '**/tests/contracts/**/*.test.{ts,tsx}',
        '**/tests/integration/**/*.test.{ts,tsx}',
      ],
      setupFilesAfterEnv: [],
    },
  ],
  collectCoverageFrom: ['core/**/*.ts', 'lib/**/*.ts', 'components/**/*.tsx'],
  coverageThreshold: {
    global: { branches: 60, functions: 60, lines: 60, statements: 60 },
  },
};

export default config;

