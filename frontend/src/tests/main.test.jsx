import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../context/notification.context';

// Mock the root element and render functions
let rootElement;
let renderMock;

// We need to mock these modules before importing the file that uses them
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: renderMock = vi.fn(),
  })),
}));

// Simple mocks that just pass children through
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }) => <div data-testid="browser-router">{children}</div>,
}));

vi.mock('../context/notification.context', () => ({
  NotificationProvider: ({ children }) => <div data-testid="notification-provider">{children}</div>,
}));

vi.mock('../App.jsx', () => ({
  default: () => <div data-testid="app-component">App Component</div>,
}));

describe('Main Application Entry Point', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create a mock DOM element for testing
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    
    // Mock document.getElementById
    document.getElementById = vi.fn(() => rootElement);
    
    // Reset the renderMock
    renderMock = vi.fn();
  });

  it('correctly initializes and renders the application with proper provider structure', async () => {
    // Import the module to trigger its execution
    await import('../main.jsx');
    
    // Check that document.getElementById was called with 'root'
    expect(document.getElementById).toHaveBeenCalledWith('root');
    
    // Verify createRoot was called with the root element
    const ReactDOM = await import('react-dom/client');
    expect(ReactDOM.createRoot).toHaveBeenCalledWith(rootElement);
    
    // Check that render was called
    expect(renderMock).toHaveBeenCalled();
    
    // Extract the rendered element from the render call
    const renderedElement = renderMock.mock.calls[0][0];
    expect(renderedElement).toBeDefined();
    
    // Test the structure
    // First ensure it's a StrictMode component
    expect(renderedElement.type).toBe(StrictMode);
    
    // Then check that inside StrictMode is a BrowserRouter
    const routerElement = renderedElement.props.children;
    expect(routerElement.type).toBe(BrowserRouter);
    
    // Inside BrowserRouter should be NotificationProvider
    const providerElement = routerElement.props.children;
    expect(providerElement.type).toBe(NotificationProvider);
    
    // And finally inside NotificationProvider should be App
    const appElement = providerElement.props.children;
    expect(appElement.props).toBeDefined();
    expect(appElement.type).toBeDefined();
  });
});
