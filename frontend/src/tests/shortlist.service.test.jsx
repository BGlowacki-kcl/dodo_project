import { describe, it, expect, vi } from 'vitest';
import { 
  getShortlist, 
  createShortlist, 
  addJobToShortlist, 
  removeJobFromShortlist 
} from '../services/shortlist.service';
import { makeApiRequest } from '../services/helper';

// Mock the helper module
vi.mock('../services/helper', () => ({
  makeApiRequest: vi.fn(),
}));

describe('Shortlist Service', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getShortlist', () => {
    it('fetches shortlist successfully', async () => {
      const mockResponse = { jobs: [{ id: '1', title: 'Job 1' }] };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await getShortlist();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/shortlist/jobs', 'GET');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Fetch error');
      makeApiRequest.mockRejectedValue(error);

      await expect(getShortlist()).rejects.toThrow('Fetch error');
    });
  });

  describe('createShortlist', () => {
    it('creates shortlist successfully', async () => {
      const mockResponse = { id: 'shortlist123' };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await createShortlist();

      expect(makeApiRequest).toHaveBeenCalledWith('/api/shortlist/create', 'POST');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Creation error');
      makeApiRequest.mockRejectedValue(error);

      await expect(createShortlist()).rejects.toThrow('Creation error');
    });
  });

  describe('addJobToShortlist', () => {
    it('adds job to shortlist successfully', async () => {
      const jobId = '123';
      const mockResponse = { jobs: [{ id: '123', title: 'Job 1' }] };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await addJobToShortlist(jobId);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/shortlist/addjob?jobid=123', 'PUT', { jobId: '123' });
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Add error');
      makeApiRequest.mockRejectedValue(error);

      await expect(addJobToShortlist('123')).rejects.toThrow('Add error');
    });
  });

  describe('removeJobFromShortlist', () => {
    it('removes job from shortlist successfully', async () => {
      const jobId = '123';
      const mockResponse = { jobs: [] };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await removeJobFromShortlist(jobId);

      expect(makeApiRequest).toHaveBeenCalledWith('/api/shortlist/removejob?jobid=123', 'DELETE');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      const error = new Error('Remove error');
      makeApiRequest.mockRejectedValue(error);

      await expect(removeJobFromShortlist('123')).rejects.toThrow('Remove error');
    });
  });
});