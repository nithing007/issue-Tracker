import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';
import './App.css';

import { UserProvider } from './context/UserContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

const GOOGLE_CLIENT_ID = "933220651174-setbdihh1rv8ro6opcgjt8rhqaav6cvm.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <UserProvider>
            <SocketProvider>
              <App />
            </SocketProvider>
          </UserProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
