import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
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
            // Override Next.js tsconfig settings that are incompatible with Jest
            jsx: 'react-jsx',
            moduleResolution: 'node',
            allowJs: true,
          },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^jose$': require.resolve('jose'),
        '\\.(css|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
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

