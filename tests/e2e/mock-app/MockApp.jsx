import React from 'react';

/**
 * Mock app for testing purposes
 * This component simulates the basic structure of the app without requiring Supabase
 */
const MockApp = () => {
  return (
    <div className="app">
      <header>
        <h1>FinTask</h1>
      </header>

      <main>
        <div className="login-container">
          <h2>Login</h2>
          <form onSubmit={e => e.preventDefault()}>
            <div>
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="Email" />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input type="password" id="password" placeholder="Password" />
            </div>
            <button type="submit">Login</button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default MockApp;
