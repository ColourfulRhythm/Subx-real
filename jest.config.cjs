module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/src/test/__mocks__/fileMock.js',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^firebase$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^firebase/auth$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^firebase/firestore$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^firebase/storage$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^../../firebase$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^../firebase$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^./firebase$': '<rootDir>/src/test/__mocks__/firebase.js',
    '^../../utils/api$': '<rootDir>/src/test/__mocks__/api.js',
    '^../utils/api$': '<rootDir>/src/test/__mocks__/api.js',
    '^./utils/api$': '<rootDir>/src/test/__mocks__/api.js',
    '^utils/api$': '<rootDir>/src/test/__mocks__/api.js'
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['@babel/preset-env', '@babel/preset-react'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(firebase|@firebase)/)'
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  globals: {
    'import.meta': {
      env: {
        VITE_FIREBASE_API_KEY: 'test-api-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain',
        VITE_FIREBASE_PROJECT_ID: 'test-project-id',
        VITE_FIREBASE_STORAGE_BUCKET: 'test-storage-bucket',
        VITE_FIREBASE_MESSAGING_SENDER_ID: 'test-sender-id',
        VITE_FIREBASE_APP_ID: 'test-app-id'
      }
    }
  }
}; 