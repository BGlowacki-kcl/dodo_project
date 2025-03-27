import { describe, it, expect, vi } from 'vitest';
import sendEmail from '../services/email.service'; // Default import
import { makeApiRequest, handleApiError } from '../services/helper';

// Mock the helper module
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
  handleApiError: vi.fn(),
}));

describe('Email Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('sends email successfully', async () => {
      const emailData = { to: 'test@example.com', subject: 'Test', body: 'Hello' };
      const mockResponse = { success: true, message: 'Email sent' };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await sendEmail(emailData);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/email', 'POST', emailData);
      expect(result).toEqual(mockResponse);
      expect(handleApiError).not.toHaveBeenCalled();
    });

    it('throws handled error on API failure', async () => {
      const emailData = { to: 'test@example.com', subject: 'Test', body: 'Hello' };
      const error = new Error('Network error');
      const handledError = { error: 'Failed to send email' };
      makeApiRequest.mockRejectedValue(error);
      handleApiError.mockReturnValue(handledError);

      await expect(sendEmail(emailData)).rejects.toEqual(handledError);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/email', 'POST', emailData);
      expect(handleApiError).toHaveBeenCalledWith(error, 'Failed to send email');
    });
  });
});