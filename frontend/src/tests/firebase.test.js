import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Mock Firebase modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => 'mocked-app')
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => 'mocked-auth')
}));

// Mock environment variables
beforeEach(() => {
  vi.stubEnv('VITE_FIREBASE_API_KEY', 'test-api-key');
  vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'test-auth-domain');
  vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'test-project-id');
  vi.stubEnv('VITE_FIREBASE_STORAGE_BUCKET', 'test-storage-bucket');
  vi.stubEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', 'test-messaging-sender-id');
  vi.stubEnv('VITE_FIREBASE_APP_ID', 'test-app-id');
  
  // Reset import cache to ensure our mocks take effect
  vi.resetModules();
});

describe('Firebase Configuration', () => {
  it('initializes Firebase with correct config', async () => {
    // Import the module after setting up the mocks
    const { app, auth } = await import('../firebase');
    
    // Verify that initializeApp was called with correct config
    expect(initializeApp).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
      authDomain: 'test-auth-domain',
      projectId: 'test-project-id',
      storageBucket: 'test-storage-bucket',
      messagingSenderId: 'test-messaging-sender-id',
      appId: 'test-app-id'
    });
    
    // Verify app and auth are properly initialized
    expect(app).toBe('mocked-app');
    expect(auth).toBe('mocked-auth');
    expect(getAuth).toHaveBeenCalledWith('mocked-app');
  });
});
