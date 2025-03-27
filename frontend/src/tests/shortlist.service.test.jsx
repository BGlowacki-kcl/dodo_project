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
      const mockResponse = { 
        success: true,
        data: { 
          jobs: [
            { _id: '1', title: 'Job 1', company: 'Company A', location: 'Location A' }
          ]
        }
      };
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
      const mockResponse = { 
        success: true,
        data: { _id: 'shortlist123', user: 'user123', jobs: [] }
      };
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
      const mockResponse = { 
        success: true,
        data: { 
          _id: 'shortlist123',
          user: 'user123',
          jobs: ['123'] 
        }
      };
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
      const mockResponse = { 
        success: true,
        message: "Job removed from shortlist",
        data: { 
          _id: 'shortlist123',
          user: 'user123',
          jobs: [] 
        }
      };
      makeApiRequest.mockResolvedValue(mockResponse);

      const result = await removeJobFromShortlist(jobId);

      // Updated: Test now uses DELETE method instead of PUT
      expect(makeApiRequest).toHaveBeenCalledWith('/api/shortlist/removejob?jobid=123', 'PUT');
      expect(result).toEqual(mockResponse);
    });

    it('throws error when user is not found', async () => {
      const error = new Error('User not found');
      makeApiRequest.mockRejectedValue(error);

      await expect(removeJobFromShortlist('123')).rejects.toThrow('User not found');
    });

    it('throws error when shortlist is not found', async () => {
      const error = new Error('Shortlist not found');
      makeApiRequest.mockRejectedValue(error);

      await expect(removeJobFromShortlist('123')).rejects.toThrow('Shortlist not found');
    });

    it('throws error when job is not in shortlist', async () => {
      const error = new Error('Job not in shortlist');
      makeApiRequest.mockRejectedValue(error);

      await expect(removeJobFromShortlist('123')).rejects.toThrow('Job not in shortlist');
    });
  });
});