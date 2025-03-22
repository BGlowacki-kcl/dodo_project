/**
 * Application Entry Point
 * Sets up React application with necessary providers
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from './context/notification.context';
import App from './App.jsx';
import './index.css';

/**
 * Mount the application to the DOM
 */
const mountApp = () => {
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement);
  
  root.render(
    <StrictMode>
      <BrowserRouter>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </BrowserRouter>
    </StrictMode>
  );
};

// Initialize the application
mountApp();