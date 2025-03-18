import assessmentController from '../../controllers/assessment.controller.js';

global.fetch = jest.fn();

describe('Assessment Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      query: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ---------------------------------------------------
  // sendCode
  // ---------------------------------------------------
  describe('sendCode', () => {
    it('should return 400 if source_code or language is missing', async () => {
      req.body = { source_code: '', language: '' }; 
      await assessmentController.sendCode(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'source_code and language are required' });
    });

    it('should send code successfully (200) and return data', async () => {
      req.body = {
        source_code: 'print("Hello")',
        language: 'python3',
      };

      // mock fetch success
      const mockJson = jest.fn().mockResolvedValue({ id: 'runnerId123' });
      fetch.mockResolvedValue({
        json: mockJson,
      });

      await assessmentController.sendCode(req, res);

      expect(fetch).toHaveBeenCalledWith(
        "https://paiza-io.p.rapidapi.com/runners/create",
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Object),
          body: JSON.stringify({ source_code: 'print("Hello")', language: 'python3' }),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Sent code successfully',
        data: { id: 'runnerId123' },
      });
    });

    it('should return 500 on internal error', async () => {
      req.body = { source_code: 'some code', language: 'python3' };
      fetch.mockRejectedValue(new Error('Fetch failed'));

      await assessmentController.sendCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Fetch failed',
      });
    });
  });

  // ---------------------------------------------------
  // getStatus
  // ---------------------------------------------------
  describe('getStatus', () => {
    it('should return 200 with status data', async () => {
      req.query = { id: 'runnerId123' };

      const mockJson = jest.fn().mockResolvedValue({ status: 'completed' });
      fetch.mockResolvedValue({ json: mockJson });

      await assessmentController.getStatus(req, res);

      expect(fetch).toHaveBeenCalledWith(
        'https://paiza-io.p.rapidapi.com/runners/get_details?id=runnerId123',
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ data: { status: 'completed' } });
    });

    it('should return 500 on error', async () => {
      req.query = { id: 'someId' };
      fetch.mockRejectedValue(new Error('Failed to fetch status'));

      await assessmentController.getStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal server error',
        error: 'Failed to fetch status',
      });
    });
  });
});
