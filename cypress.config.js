
const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    // Outras configurações do seu projeto
    //baseUrl: 'http://localhost:3000', // exemplo de outra configuração
    viewportWidth: 1280,               // exemplo de outra configuração
    viewportHeight: 720,               // exemplo de outra configuração
  },
});

const { verifyDownloadTasks } = require('cy-verify-downloads');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', verifyDownloadTasks);
      
    },
  },
});
