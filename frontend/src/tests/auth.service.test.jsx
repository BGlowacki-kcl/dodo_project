import { describe, it, expect, afterEach, vi } from 'vitest';
import { authService, checkTokenExpiration } from '../services/auth.service';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  getAuth 
} from 'firebase/auth';
import { verifyUserRole, checkProfileCompletion, userService } from '../services/user.service';
import { makeApiRequest } from '../services/helper';
import { createShortlist } from '../services/shortlist.service';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  getAuth: vi.fn(() => ({})), // Mock auth object
}));

// Mock Firebase config
vi.mock('../firebase.js', () => ({
  auth: {},
}));

// Mock user.service.js
vi.mock('../services/user.service', () => ({
  verifyUserRole: vi.fn(),
  checkProfileCompletion: vi.fn(),
  userService: {
    createBasicUser: vi.fn(),
  },
}));

// Mock helper.js
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
}));

// Mock shortlist.service.js
vi.mock('../services/shortlist.service', () => ({
  createShortlist: vi.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    // Mock window.dispatchEvent as a spy
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.restoreAllMocks(); // Restore original window.dispatchEvent
  });

  describe('checkTokenExpiration', () => {
    it('signs out on 403 with LOGOUT action', async () => {
      const response = {
        status: 403,
        json: vi.fn().mockResolvedValue({ action: 'LOGOUT' }),
      };
      vi.spyOn(authService, 'signOut').mockResolvedValue();
      await checkTokenExpiration(response);
      expect(authService.signOut).toHaveBeenCalled();
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'sessionExpired' }));
    });

    it('does nothing on 403 without LOGOUT action', async () => {
      const response = {
        status: 403,
        json: vi.fn().mockResolvedValue({ action: 'OTHER' }),
      };
      vi.spyOn(authService, 'signOut');
      await checkTokenExpiration(response);
      expect(authService.signOut).not.toHaveBeenCalled();
      expect(window.dispatchEvent).not.toHaveBeenCalled();
    });

    it('does nothing on non-403 status', async () => {
      const response = {
        status: 200,
        json: vi.fn(),
      };
      vi.spyOn(authService, 'signOut');
      await checkTokenExpiration(response);
      expect(authService.signOut).not.toHaveBeenCalled();
      expect(response.json).not.toHaveBeenCalled();
    });

    it('handles json parsing error gracefully', async () => {
      const response = {
        status: 403,
        json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
      };
      vi.spyOn(authService, 'signOut');
      await checkTokenExpiration(response);
      expect(authService.signOut).not.toHaveBeenCalled();
    });
  });

  describe('authService.signUp', () => {
    it('registers a jobSeeker successfully', async () => {
      const mockUserCredential = {
        user: { getIdToken: vi.fn().mockResolvedValue('token123') },
      };
      createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      userService.createBasicUser.mockResolvedValue();
      createShortlist.mockResolvedValue();
      checkProfileCompletion.mockResolvedValue();
      const navigate = vi.fn();

      await authService.signUp('test@example.com', 'password', false, navigate);

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(getAuth(), 'test@example.com', 'password');
      expect(sessionStorage.getItem('token')).toBe('token123');
      expect(sessionStorage.getItem('role')).toBe('jobSeeker');
      expect(userService.createBasicUser).toHaveBeenCalledWith({ email: 'test@example.com', role: 'jobSeeker' });
      expect(createShortlist).toHaveBeenCalled();
      expect(checkProfileCompletion).toHaveBeenCalledWith(navigate);
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'authChange' }));
    });

    it('registers an employer successfully', async () => {
      const mockUserCredential = {
        user: { getIdToken: vi.fn().mockResolvedValue('token123') },
      };
      createUserWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      userService.createBasicUser.mockResolvedValue();
      createShortlist.mockResolvedValue();
      checkProfileCompletion.mockResolvedValue();
      const navigate = vi.fn();

      await authService.signUp('employer@example.com', 'password', true, navigate);

      expect(sessionStorage.getItem('role')).toBe('employer');
      expect(checkProfileCompletion).toHaveBeenCalledWith(navigate);
    });

    it('throws error on missing email or password', async () => {
      const navigate = vi.fn();
      await expect(authService.signUp('', 'password', false, navigate)).rejects.toThrow('Email and password are required');
      await expect(authService.signUp('test@example.com', '', false, navigate)).rejects.toThrow('Email and password are required');
    });

    it('throws error on signup failure', async () => {
      createUserWithEmailAndPassword.mockRejectedValue(new Error('Signup error'));
      const navigate = vi.fn();
      await expect(authService.signUp('test@example.com', 'password', false, navigate)).rejects.toThrow('Signup failed: Signup error');
    });
  });

  describe('authService.signIn', () => {
    it('signs in a jobSeeker successfully', async () => {
      const mockUserCredential = {
        user: { getIdToken: vi.fn().mockResolvedValue('token123') },
      };
      verifyUserRole.mockResolvedValue(true);
      signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      checkProfileCompletion.mockResolvedValue();
      const navigate = vi.fn();

      await authService.signIn('test@example.com', 'password', navigate, 'jobSeeker');

      expect(verifyUserRole).toHaveBeenCalledWith('test@example.com', 'jobSeeker');
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(getAuth(), 'test@example.com', 'password');
      expect(sessionStorage.getItem('token')).toBe('token123');
      expect(sessionStorage.getItem('role')).toBe('jobSeeker');
      expect(checkProfileCompletion).toHaveBeenCalledWith(navigate);
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'authChange' }));
    });

    it('signs in an employer successfully', async () => {
      const mockUserCredential = {
        user: { getIdToken: vi.fn().mockResolvedValue('token123') },
      };
      verifyUserRole.mockResolvedValue(true);
      signInWithEmailAndPassword.mockResolvedValue(mockUserCredential);
      const navigate = vi.fn();

      await authService.signIn('employer@example.com', 'password', navigate, 'employer');

      expect(verifyUserRole).toHaveBeenCalledWith('employer@example.com', 'employer');
      expect(sessionStorage.getItem('role')).toBe('employer');
      expect(checkProfileCompletion).not.toHaveBeenCalled();
    });

    it('throws error on missing email or password', async () => {
      const navigate = vi.fn();
      await expect(authService.signIn('', 'password', navigate, 'jobSeeker')).rejects.toThrow('Email and password are required');
    });

    it('throws error on invalid role for jobSeeker', async () => {
      verifyUserRole.mockResolvedValue(false);
      const navigate = vi.fn();
      await expect(authService.signIn('test@example.com', 'password', navigate, 'jobSeeker')).rejects.toThrow('Use login page for employers');
    });

    it('throws error on invalid role for employer', async () => {
      verifyUserRole.mockResolvedValue(false);
      const navigate = vi.fn();
      await expect(authService.signIn('employer@example.com', 'password', navigate, 'employer')).rejects.toThrow('Use login page for job seekers');
    });

    it('throws error on signin failure', async () => {
      verifyUserRole.mockResolvedValue(true);
      signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid credentials'));
      const navigate = vi.fn();
      await expect(authService.signIn('test@example.com', 'password', navigate, 'jobSeeker')).rejects.toThrow('Invalid credentials');
    });
  });

  describe('authService.signOut', () => {
    it('signs out successfully', async () => {
      signOut.mockResolvedValue(undefined); // Explicitly resolve with undefined
      sessionStorage.setItem('token', 'token123');
      sessionStorage.setItem('role', 'jobSeeker');

      await authService.signOut();

      expect(signOut).toHaveBeenCalledWith(getAuth());
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('role')).toBeNull();
      expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'authChange' }));
    });

    it('throws error on signout failure', async () => {
      const error = new Error('Signout error');
      signOut.mockRejectedValue(error);
      await expect(authService.signOut()).rejects.toThrow('Sign out not successful');
    });
  });
});