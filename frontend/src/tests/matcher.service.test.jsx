import { describe, it, expect, vi } from 'vitest';
import { getRecommendedJobs } from '../services/matcher.service';
import { getAuth } from 'firebase/auth';
import { handleApiError } from '../services/helper';

// Mock Firebase auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
}));

// Mock helper.js
vi.mock('../services/helper', () => ({
  handleApiError: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Matcher Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getRecommendedJobs', () => {
    it('fetches recommended jobs successfully with authenticated user', async () => {
      const mockToken = 'test-token';
      const mockUser = { getIdToken: vi.fn().mockResolvedValue(mockToken) };
      const mockAuth = { currentUser: mockUser };
      getAuth.mockReturnValue(mockAuth);
      const mockResponse = { recommendedJobs: [{ id: '1', title: 'Job 1' }] };
      fetch.mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      });

      const result = await getRecommendedJobs();

      expect(getAuth).toHaveBeenCalled();
      expect(mockUser.getIdToken).toHaveBeenCalled();
      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/matcher/recommend-jobs', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
      });
      expect(result).toEqual(mockResponse.recommendedJobs);
      expect(handleApiError).not.toHaveBeenCalled();
    });

    it('returns error when user is not authenticated', async () => {
      const mockAuth = { currentUser: null };
      getAuth.mockReturnValue(mockAuth);
      const mockError = { status: 500, message: 'Failed to get job recommendations' };
      handleApiError.mockReturnValue(mockError);

      const result = await getRecommendedJobs();

      expect(getAuth).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
      expect(handleApiError).toHaveBeenCalledWith(expect.any(Error), 'Failed to get job recommendations');
      expect(result).toEqual(mockError);
    });

    it('handles fetch failure', async () => {
      const mockToken = 'test-token';
      const mockUser = { getIdToken: vi.fn().mockResolvedValue(mockToken) };
      const mockAuth = { currentUser: mockUser };
      getAuth.mockReturnValue(mockAuth);
      const mockError = { status: 500, message: 'Failed to get job recommendations' };
      fetch.mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({}),
      });
      handleApiError.mockReturnValue(mockError);

      const result = await getRecommendedJobs();

      expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/matcher/recommend-jobs', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mockToken}`,
        },
      });
      expect(handleApiError).toHaveBeenCalledWith(expect.any(Error), 'Failed to get job recommendations');
      expect(result).toEqual(mockError);
    });

    it('handles network error', async () => {
      const mockToken = 'test-token';
      const mockUser = { getIdToken: vi.fn().mockResolvedValue(mockToken) };
      const mockAuth = { currentUser: mockUser };
      getAuth.mockReturnValue(mockAuth);
      const mockError = { status: 500, message: 'Failed to get job recommendations' };
      fetch.mockRejectedValue(new Error('Network error'));
      handleApiError.mockReturnValue(mockError);

      const result = await getRecommendedJobs();

      expect(fetch).toHaveBeenCalled();
      expect(handleApiError).toHaveBeenCalledWith(expect.any(Error), 'Failed to get job recommendations');
      expect(result).toEqual(mockError);
    });
  });
});