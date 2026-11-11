import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { restoreRedirectedSpaPath } from './utils/router';
import './index.css';

restoreRedirectedSpaPath();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

