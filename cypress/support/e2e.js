// Import commands
import './commands';

// Handle uncaught exceptions - must be at the top level
Cypress.on('uncaught:exception', (err, runnable) => {
  console.log('Caught exception:', err.message);
  return false;
});

// Additional error handling
Cypress.on('window:before:load', win => {
  win.addEventListener('error', e => {
    console.log('Window error caught:', e.message);
    e.preventDefault();
    return false;
  });
});

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}
