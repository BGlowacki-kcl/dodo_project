import { describe, it, expect, vi } from 'vitest';
import { checkTokenExpiration } from '../services/auth.service';
import { makeApiRequest } from '../services/helper';

describe('Resume Service', () => {
  beforeEach(() => {
    vi.resetModules(); // Clear module cache before each test
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getParsedResume', () => {
    it('parses resume successfully with valid PDF', async () => {
      vi.mock('pdfjs-dist/build/pdf', () => ({
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: vi.fn(() => ({
          promise: Promise.resolve({
            numPages: 1,
            getPage: vi.fn(() => Promise.resolve({
              getTextContent: vi.fn(() => Promise.resolve({
                items: [{ str: 'Sample Text' }],
              })),
            })),
          }),
        })),
      }));
      vi.mock('../services/auth.service', () => ({
        checkTokenExpiration: vi.fn(),
      }));
      vi.mock('../services/helper', () => ({
        makeApiRequest: vi.fn(),
      }));
      const { default: getParsedResume } = await import('../services/resume.service');

      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      };
      const mockApiResponse = {
        choices: [{ message: { content: '{"data": {"name": "John Doe"}}' } }]
      };
      makeApiRequest.mockResolvedValue(mockApiResponse);

      const result = await getParsedResume(mockFile);

      expect(mockFile.arrayBuffer).toHaveBeenCalled();
      expect(makeApiRequest).toHaveBeenCalledWith('/api/chat', 'POST', { query: 'Sample Text\n\n' });
      expect(result).toEqual({ name: 'John Doe' });
    });

    it('throws error on PDF extraction failure', async () => {
      vi.mock('pdfjs-dist/build/pdf', () => ({
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: vi.fn(),
      }));
      vi.mock('../services/auth.service', () => ({
        checkTokenExpiration: vi.fn(),
      }));
      vi.mock('../services/helper', () => ({
        makeApiRequest: vi.fn(),
      }));
      const { default: getParsedResume } = await import('../services/resume.service');

      const mockFile = {
        arrayBuffer: vi.fn().mockRejectedValue(new Error('Invalid PDF')),
      };

      await expect(getParsedResume(mockFile)).rejects.toThrow('Error parsing resume: Error reading PDF: Invalid PDF');
      expect(makeApiRequest).not.toHaveBeenCalled();
    });

    it('handles invalid API response format', async () => {
      vi.mock('pdfjs-dist/build/pdf', () => ({
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: vi.fn(() => ({
          promise: Promise.resolve({
            numPages: 1,
            getPage: vi.fn(() => Promise.resolve({
              getTextContent: vi.fn(() => Promise.resolve({
                items: [{ str: 'Sample Text' }],
              })),
            })),
          }),
        })),
      }));
      vi.mock('../services/auth.service', () => ({
        checkTokenExpiration: vi.fn(),
      }));
      vi.mock('../services/helper', () => ({
        makeApiRequest: vi.fn(),
      }));
      const { default: getParsedResume } = await import('../services/resume.service');

      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      };
      const mockApiResponse = {
        choices: [{ message: { content: 'Invalid JSON' } }]
      };
      makeApiRequest.mockResolvedValue(mockApiResponse);

      const result = await getParsedResume(mockFile);

      expect(result).toBeNull();
    });

    it('throws error on API failure', async () => {
      vi.mock('pdfjs-dist/build/pdf', () => ({
        GlobalWorkerOptions: { workerSrc: '' },
        getDocument: vi.fn(() => ({
          promise: Promise.resolve({
            numPages: 1,
            getPage: vi.fn(() => Promise.resolve({
              getTextContent: vi.fn(() => Promise.resolve({
                items: [{ str: 'Sample Text' }],
              })),
            })),
          }),
        })),
      }));
      vi.mock('../services/auth.service', () => ({
        checkTokenExpiration: vi.fn(),
      }));
      vi.mock('../services/helper', () => ({
        makeApiRequest: vi.fn(),
      }));
      const { default: getParsedResume } = await import('../services/resume.service');

      const mockFile = {
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      };
      const error = new Error('API error');
      makeApiRequest.mockRejectedValue(error);

      await expect(getParsedResume(mockFile)).rejects.toThrow('Error parsing resume: API error');
    });
  });
});