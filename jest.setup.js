// jest.setup.js
// Importa matchers adicionais do jest-dom para todos os testes usando a sintaxe CommonJS
require('@testing-library/jest-dom');

// Carrega as variáveis de ambiente do .env.local para os testes
require('dotenv').config({ path: './.env.local' });
