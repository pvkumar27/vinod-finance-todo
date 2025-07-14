import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import UpdateToast from './components/UpdateToast';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Service worker registration with update handling
let updateToastContainer = null;
let showUpdateToast = null;

const createUpdateToastContainer = () => {
  if (!updateToastContainer) {
    updateToastContainer = document.createElement('div');
    updateToastContainer.id = 'update-toast-container';
    document.body.appendChild(updateToastContainer);
  }
  return updateToastContainer;
};

const handleServiceWorkerUpdate = (registration) => {
  // Only show update toast in production (not localhost)
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  );
  
  if (isLocalhost) {
    console.log('Update available, but skipping toast in development mode');
    return;
  }

  const container = createUpdateToastContainer();
  const toastRoot = ReactDOM.createRoot(container);
  
  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    window.location.reload(true);
  };
  
  const handleDismiss = () => {
    toastRoot.unmount();
    if (updateToastContainer) {
      document.body.removeChild(updateToastContainer);
      updateToastContainer = null;
    }
  };
  
  toastRoot.render(
    <UpdateToast 
      show={true} 
      onUpdate={handleUpdate} 
      onDismiss={handleDismiss} 
    />
  );
};

serviceWorkerRegistration.register({
  onUpdate: handleServiceWorkerUpdate,
  onSuccess: () => {
    console.log('Content is cached for offline use.');
  }
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
