// Import commands
import './commands';

// Handle uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore all KeyboardEvent related errors
  if (
    err.message &&
    (err.message.includes('KeyboardEvent') ||
      err.message.includes('Cannot read properties of undefined'))
  ) {
    return false;
  }
  return true;
});

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}
