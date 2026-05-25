/**
 * Configuração do Jest para o Frontend
 */

export default {
  testEnvironment: 'jsdom',
  
  moduleFileExtensions: ['js', 'json'],
  
  testMatch: ['**/*.spec.js'],
  
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(@ionic)/)',
  ],
  
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  moduleNameMapper: {
    '^@environment$': '<rootDir>/src/environments/environment.js',
    '^@environment/(.*)$': '<rootDir>/src/environments/$1',
    '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
  },
  
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.css',
    '!src/main.js',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  verbose: true,
  testTimeout: 10000,
};
