// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Esta é a lista mais abrangente de módulos que precisam ser transformados.
  // Inclui lucide-react, @supabase e outras libs que usam ESM e falham.
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react|@supabase|isows|d3-shape|d3-path|d3-scale|d3-array|d3-time-format|d3-format|d3-interpolate|d3-color|d3-time|internmap|delaunator|robust-predicates|@radix-ui|react-day-picker|@dnd-kit|screenfull)/',
  ],
}

module.exports = createJestConfig(customJestConfig)
