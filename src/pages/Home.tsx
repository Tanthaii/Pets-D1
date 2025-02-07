import React from 'react';

export function Home() {
  return (
    <div className="container">
      <h1>PestDetect Mobile</h1>
      <p>This is a preview of how the mobile app will look. The actual mobile app requires NativeScript setup on your local machine.</p>
      
      <div className="actions">
        <a href="/detection" className="button">Start Detection</a>
        <a href="/register" className="button">Create Account</a>
      </div>
      
      <div className="note">
        <p><strong>Note:</strong> To run this as a native mobile app:</p>
        <ol>
          <li>Install NativeScript CLI: <code>npm install -g @nativescript/cli</code></li>
          <li>Clone the repository to your local machine</li>
          <li>Run <code>ns run android</code> or <code>ns run ios</code></li>
        </ol>
      </div>
    </div>
  );
}