// jest.config.js
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Fornece o caminho para o seu aplicativo Next.js para carregar o next.config.js e os arquivos .env no seu ambiente de teste
  dir: './',
})

// Adiciona qualquer configuração personalizada a ser passada para o Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Mapeia os aliases de caminho para o Jest
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Ignora a transformação de módulos, exceto para os módulos ESM problemáticos
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react|@supabase|isows|d3-shape|d3-path|d3-scale|d3-array|d3-time-format|d3-format|d3-interpolate|d3-color|d3-time|internmap|delaunator|robust-predicates|@radix-ui|react-day-picker|@dnd-kit|screenfull)',
  ],
}

// createJestConfig é exportado desta forma para garantir que o next/jest possa carregar a configuração do Next.js, que é assíncrona
module.exports = createJestConfig(customJestConfig)
