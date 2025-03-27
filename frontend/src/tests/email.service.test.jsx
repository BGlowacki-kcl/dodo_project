// src/tests/email.service.test.jsx
import { describe, it, expect, afterEach, vi } from 'vitest';
import sendEmail from '../services/email.service'; // Fixed import to match actual filename
import { makeApiRequest, handleApiError } from '../services/helper';

// Mock the helper module
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
  handleApiError: vi.fn()
}));

describe('Email Service - sendEmail', () => {
  const validEmailData = {
    to: 'test@example.com',
    subject: 'Test Subject',
    body: 'Test Body'
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successfully sends an email with valid data', async () => {
    const mockResponse = { success: true, messageId: '123', status: 200 };
    makeApiRequest.mockResolvedValue(mockResponse);

    const result = await sendEmail(validEmailData);

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/email',
      'POST',
      validEmailData,
      false
    );
    expect(result).toEqual(mockResponse);
    expect(handleApiError).not.toHaveBeenCalled();
  });

  it('handles API failure with network error', async () => {
    const mockError = new Error('Network Error');
    const formattedError = new Error('Failed to send email: Network Error');
    makeApiRequest.mockRejectedValue(mockError);
    handleApiError.mockReturnValue(formattedError);

    await expect(sendEmail(validEmailData)).rejects.toThrow(formattedError);
    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/email',
      'POST',
      validEmailData,
      false
    );
    expect(handleApiError).toHaveBeenCalledWith(mockError, 'Failed to send email');
  });

  it('verifies correct API endpoint and method', async () => {
    makeApiRequest.mockResolvedValue({ success: true });

    await sendEmail(validEmailData);

    expect(makeApiRequest).toHaveBeenCalledTimes(1);
    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/email',
      'POST',
      validEmailData,
      false
    );
  });

  it('handles empty email data', async () => {
    const emptyEmailData = {};
    makeApiRequest.mockResolvedValue({ success: true });

    await sendEmail(emptyEmailData);

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/email',
      'POST',
      emptyEmailData,
      false
    );
  });

  it('handles 400 Bad Request error', async () => {
    const mockError = { status: 400, message: 'Invalid email format' };
    const formattedError = new Error('Failed to send email: Invalid email format');
    makeApiRequest.mockRejectedValue(mockError);
    handleApiError.mockReturnValue(formattedError);

    await expect(sendEmail(validEmailData)).rejects.toThrow(formattedError);
    expect(handleApiError).toHaveBeenCalledWith(mockError, 'Failed to send email');
  });

  it('handles 500 Server Error', async () => {
    const mockError = { status: 500, message: 'Server error' };
    const formattedError = new Error('Failed to send email: Server error');
    makeApiRequest.mockRejectedValue(mockError);
    handleApiError.mockReturnValue(formattedError);

    await expect(sendEmail(validEmailData)).rejects.toThrow(formattedError);
    expect(handleApiError).toHaveBeenCalledWith(mockError, 'Failed to send email');
  });

  it('handles missing required fields', async () => {
    const incompleteEmailData = { to: 'test@example.com' };
    makeApiRequest.mockResolvedValue({ success: true });

    await sendEmail(incompleteEmailData);

    expect(makeApiRequest).toHaveBeenCalledWith(
      '/api/email',
      'POST',
      incompleteEmailData,
      false
    );
  });
});