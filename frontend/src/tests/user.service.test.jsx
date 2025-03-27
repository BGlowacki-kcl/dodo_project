import { describe, it, expect, vi } from 'vitest';
import { 
  userService, 
  verifyUserRole, 
  checkProfileCompletion 
} from '../services/user.service';
import { makeApiRequest } from '../services/helper';

// Mock the helper module
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
}));

describe('User Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('userService.updateUser', () => {
    it('updates user successfully', async () => {
      const userData = { name: 'John Doe' };
      const mockResponse = { id: '123', ...userData };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await userService.updateUser(userData);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/', 'PUT', userData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Update failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(userService.updateUser({ name: 'John Doe' })).rejects.toThrow('Update failed');
    });
  });

  describe('userService.getUserProfile', () => {
    it('fetches user profile successfully', async () => {
      const mockResponse = { id: '123', name: 'John Doe' };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await userService.getUserProfile();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Profile fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(userService.getUserProfile()).rejects.toThrow('Profile fetch failed');
    });
  });

  describe('userService.getUserRole', () => {
    it('fetches user role successfully when authenticated', async () => {
      sessionStorage.setItem('token', 'test-token');
      const mockResponse = 'jobSeeker';
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await userService.getUserRole();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/role', 'GET');
      expect(result).toBe('jobSeeker');
    });

    it('returns "unLogged" when no token', async () => {
      const result = await userService.getUserRole();

      expect(result).toBe('unLogged');
      expect(makeApiRequest).not.toHaveBeenCalled();
    });

    it('throws error on failure', async () => {
      sessionStorage.setItem('token', 'test-token');
      const error = new Error('Role fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(userService.getUserRole()).rejects.toThrow('Role fetch failed');
    });
  });

  describe('userService.getUserId', () => {
    it('fetches user ID successfully', async () => {
      const mockResponse = { _id: '123', name: 'John Doe' };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await userService.getUserId();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/', 'GET');
      expect(result).toBe('123');
    });

    it('throws error on failure', async () => {
      const error = new Error('ID fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(userService.getUserId()).rejects.toThrow('ID fetch failed');
    });
  });

  describe('userService.getUserById', () => {
    it('fetches user by ID successfully', async () => {
      const mockResponse = { id: '456', name: 'Jane Doe' };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await userService.getUserById('456');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/ById?userId=456', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('User fetch failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(userService.getUserById('456')).rejects.toThrow('User fetch failed');
    });
  });

  describe('userService.createBasicUser', () => {
    it('creates basic user successfully', async () => {
      const userData = { email: 'test@example.com', role: 'jobSeeker' };
      const mockResponse = { id: '789', ...userData };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await userService.createBasicUser(userData);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/basic', 'POST', userData);
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Creation failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(userService.createBasicUser({ email: 'test@example.com' })).rejects.toThrow('Creation failed');
    });
  });

  describe('verifyUserRole', () => {
    it('returns true when role matches', async () => {
      makeApiRequest.mockResolvedValue('jobSeeker');

      const result = await verifyUserRole('test@example.com', 'jobSeeker');

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/role?email=test@example.com', 'GET');
      expect(result).toBe(true);
    });

    it('returns false when role does not match', async () => {
      makeApiRequest.mockResolvedValue('employer');

      const result = await verifyUserRole('test@example.com', 'jobSeeker');

      expect(result).toBe(false);
    });

    it('throws error on failure', async () => {
      const error = new Error('Role verification failed');
      makeApiRequest.mockRejectedValue(error);

      await expect(verifyUserRole('test@example.com', 'jobSeeker')).rejects.toThrow('Role verification failed');
    });
  });

  describe('checkProfileCompletion', () => {
    it('navigates to home when profile is complete', async () => {
      const mockResponse = true;
      makeApiRequest.mockResolvedValue(mockResponse);
      sessionStorage.setItem('role', 'jobSeeker');
      const navigate = vi.fn();

      await checkProfileCompletion(navigate);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/user/completed', 'GET');
      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('navigates to addDetails when profile is incomplete for jobSeeker', async () => {
      const mockResponse = false;
      makeApiRequest.mockResolvedValue(mockResponse);
      sessionStorage.setItem('role', 'jobSeeker');
      const navigate = vi.fn();

      await checkProfileCompletion(navigate);

      expect(navigate).toHaveBeenCalledWith('/addDetails');
    });

    it('navigates to home for non-jobSeeker role', async () => {
      const mockResponse = false;
      makeApiRequest.mockResolvedValue(mockResponse);
      sessionStorage.setItem('role', 'employer');
      const navigate = vi.fn();

      await checkProfileCompletion(navigate);

      expect(navigate).toHaveBeenCalledWith('/');
    });

    it('navigates to addDetails on error', async () => {
      const error = new Error('Fetch error');
      makeApiRequest.mockRejectedValue(error);
      const navigate = vi.fn();

      await checkProfileCompletion(navigate);

      expect(navigate).toHaveBeenCalledWith('/addDetails');
    });
  });
});