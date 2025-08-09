// Import commands
import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the error from failing the test
  return false;
});

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}
