import { describe, it, expect, vi } from 'vitest';
import { makeApiRequest, handleApiError } from '../services/helper';
import { checkTokenExpiration } from '../services/auth.service';

// Mock fetch globally
global.fetch = vi.fn();

// Mock auth.service.js
vi.mock('../services/auth.service', () => ({
  checkTokenExpiration: vi.fn(),
}));

describe('Helper Functions', () => {
  afterEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  describe('makeApiRequest', () => {
    it('makes a successful GET request without body', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const mockJsonPromise = Promise.resolve(mockResponse);
      const mockFetchResponse = {
        json: () => mockJsonPromise,
        clone: () => ({ json: () => Promise.resolve(mockResponse) })
      };
      fetch.mockResolvedValue(mockFetchResponse);
      sessionStorage.setItem('token', 'test-token');

      const result = await makeApiRequest('/api/test', 'GET');

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
      });
      expect(checkTokenExpiration).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ id: 1 });
    });

    it('makes a successful POST request with body', async () => {
      const mockResponse = { success: true, data: { id: 2 } };
      const mockJsonPromise = Promise.resolve(mockResponse);
      const mockFetchResponse = {
        json: () => mockJsonPromise,
        clone: () => ({ json: () => Promise.resolve(mockResponse) })
      };
      fetch.mockResolvedValue(mockFetchResponse);
      sessionStorage.setItem('token', 'test-token');
      const body = { key: 'value' };

      const result = await makeApiRequest('/api/test', 'POST', body);

      expect(fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify(body),
      });
      expect(checkTokenExpiration).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toEqual({ id: 2 });
    });

    it('throws error on unsuccessful response', async () => {
      const mockResponse = { success: false, message: 'Request failed' };
      const mockJsonPromise = Promise.resolve(mockResponse);
      const mockFetchResponse = {
        json: () => mockJsonPromise,
        clone: () => ({ json: () => Promise.resolve(mockResponse) })
      };
      fetch.mockResolvedValue(mockFetchResponse);

      await expect(makeApiRequest('/api/test', 'GET')).rejects.toThrow('Request failed');
      expect(checkTokenExpiration).toHaveBeenCalledWith(expect.any(Object));
    });

    it('throws default error on unsuccessful response without message', async () => {
      const mockResponse = { success: false };
      const mockJsonPromise = Promise.resolve(mockResponse);
      const mockFetchResponse = {
        json: () => mockJsonPromise,
        clone: () => ({ json: () => Promise.resolve(mockResponse) })
      };
      fetch.mockResolvedValue(mockFetchResponse);

      await expect(makeApiRequest('/api/test', 'POST')).rejects.toThrow('Failed to post /api/test');
      expect(checkTokenExpiration).toHaveBeenCalledWith(expect.any(Object));
    });

    it('handles fetch errors', async () => {
      // Make sure the mock is cleared before this specific test
      checkTokenExpiration.mockClear();
      
      fetch.mockRejectedValue(new Error('Network error'));
      
      // Use try/catch to ensure we can verify mock calls after the error
      try {
        await makeApiRequest('/api/test', 'GET');
        // If we reach here, the test should fail because an error wasn't thrown
        expect(true).toBe(false); // Force test failure
      } catch (error) {
        expect(error.message).toBe('Network error');
        // Verify checkTokenExpiration wasn't called using mock call count
        expect(checkTokenExpiration).not.toHaveBeenCalled();
      }
    });
  });

  describe('handleApiError', () => {
    it('returns 403 error for unauthorized response', () => {
      const error = {
        response: { status: 403 },
      };
      const result = handleApiError(error, 'Test error');
      expect(result).toEqual({
        status: 403,
        message: 'You are not authorized to perform this action',
      });
    });

    it('returns 500 error for other errors', () => {
      const error = new Error('Generic error');
      const result = handleApiError(error, 'Custom message');
      expect(result).toEqual({
        status: 500,
        message: 'Custom message',
      });
    });

    it('returns 500 error without response property', () => {
      const error = {};
      const result = handleApiError(error, 'Test error');
      expect(result).toEqual({
        status: 500,
        message: 'Test error',
      });
    });
  });
});