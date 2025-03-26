import request from "supertest";
import { app } from "../../app.js";
import { mockUser } from "../fixtures/user.fixture.js";
import User from "../../models/user/user.model.js";
import { JobSeeker } from "../../models/user/jobSeeker.model.js";
import { Employer } from "../../models/user/Employer.model.js";
import { userController, getUserRole, fetchUserByUid, fetchUserById, getMissingFields, validateAuth, createNewUser } from "../../controllers/user.controller.js";

// Fix middleware mock to properly set uid
jest.mock('../../middlewares/auth.middleware.js', () => ({
    checkRole: () => (req, res, next) => {
        if (req.headers.authorization) {
            req.uid = "mock-firebase-uid";
            next();
        } else {
            res.status(401).json({ success: false, message: "Unauthorized" });
        }
    }
}));

// Fix user model mock setup
beforeEach(() => {
    User.findOne = jest.fn();
    User.findOneAndDelete = jest.fn();
    jest.clearAllMocks();
});

describe("GET /api/user/role", () => {
  it("should respond with 200 and return the user's role", async () => {
    const mockUserData = { email: "test@test.com", role: "jobSeeker" };
    User.findOne = jest.fn().mockResolvedValue(mockUserData);

    const response = await request(app)
      .get("/api/user/role?email=test@test.com")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "User found",
      data: mockUserData.role
    });
  });

  it("should return 400 if email is missing", async () => {
    const response = await request(app)
      .get("/api/user/role")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: "Email is required"
    });
  });

  it("should return 404 if user not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .get("/api/user/role?email=notfound@test.com")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: "User not found"
    });
  });
});

describe("GET /api/user", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 400 if no uid is provided", async () => {
    const response = await request(app).get("/api/user").set("Authorization", "Bearer mockToken");;
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "No user provided!");
  });

  test("Should return 404 if user not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    jest.doMock('../../middlewares/auth.middleware.js', () => ({
      checkRole: () => (req, res, next) => {
        req.uid = "different-mock-user"
      }
    }));

    const response = await request(app).get("/api/user?uid=unknown-uid").set("Authorization", "Bearer mockToken");;
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "No user found with this ID");
  });

  test("Should return 200 and the user if found", async () => {
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app).get("/api/user?uid=mock-firebase-uid").set("Authorization", "Bearer mockToken");;
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data.email).toBe(mockUser.email);
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/user?uid=any").set("Authorization", "Bearer mockToken");;
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Server error");
  });
});

describe("GET /api/user/completed", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 401 if no uid in req", async () => {
    jest.doMock('../../middlewares/auth.middleware.js', () => ({
      checkRole: () => (req, res, next) => {
        next();
      }
    }));

    const response = await request(app).get("/api/user/completed");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  test("Should return 404 if user not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app).get("/api/user/completed").set("Authorization", "Bearer mockToken");;
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should return 403 if missing required fields", async () => {
    const incompleteUser = { 
      uid: "mockUid",
      email: "test@test.com",
      role: "jobSeeker"
      // missing name, phoneNumber, location
    };
    User.findOne.mockResolvedValue(incompleteUser);

    const response = await request(app)
      .get("/api/user/completed")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      success: true,
      message: "Profile incomplete",
      redirect: "/addDetails",
      missingFields: ["name", "phoneNumber", "location"],
      data: false
    });
  });

  it("should return 200 if profile is completed", async () => {
    const completeUser = {
      uid: "mockUid",
      email: "test@test.com",
      role: "jobSeeker",
      name: "Test User",
      phoneNumber: "1234567890",
      location: "Test City"
    };
    User.findOne.mockResolvedValue(completeUser);

    const response = await request(app)
      .get("/api/user/completed")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "Profile is completed",
      data: true
    });
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/user/completed?uid=something").set("Authorization", "Bearer mockToken");;
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Server error");
  });
});

describe("POST /api/user/basic", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 401 if no uid in req", async () => {
    jest.doMock('../../middlewares/auth.middleware.js', () => ({
      checkRole: () => (req, res, next) => {
        next();
      }
    }));

    const response = await request(app)
      .post("/api/user/basic")
      .send({ email: "test@example.com", role: "jobSeeker" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  test("Should return 400 if missing required fields", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const response = await request(app)
      .post("/api/user/basic")
      .send({ role: "jobSeeker" })
      .set("Authorization", "Bearer mockToken");
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Missing required fields");
  });

  test("Should return 400 if user already exists", async () => {
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app)
      .post("/api/user/basic")
      .send({ email: "test@example.com", role: "jobSeeker" })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("User already exists");
  });

  test("Should create a new user (jobSeeker) if valid", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const mockSave = jest.fn().mockResolvedValue(true);
    const mockNewUser = { ...mockUser, save: mockSave };

    jest.spyOn(JobSeeker.prototype, "save").mockResolvedValue(); 

    jest.spyOn(JobSeeker.prototype, "constructor").mockImplementation(function() {
      this.uid = "mock-firebase-uid";
      this.email = "test@example.com";
      this.role = "jobSeeker";
      return this;
    });

    const response = await request(app)
      .post("/api/user/basic")
      .send({ email: "test@example.com", role: "jobSeeker" })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(201);
    expect(response.body.message).toBe("User created successfully");
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .post("/api/user/basic")
      .send({ email: "test@example.com", role: "jobSeeker" })
      .set("Authorization", "Bearer mockToken");
    
    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Server error");
  });
});

describe("PUT /api/user", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 401 if no uid in req", async () => {
    jest.doMock('../../middlewares/auth.middleware.js', () => ({
      checkRole: () => (req, res, next) => {
        next(); // no uid
      }
    }));

    const response = await request(app)
      .put("/api/user")
      .send({ name: "New Name" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  test("Should return 404 if user is not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .put("/api/user")
      .send({ name: "New Name" })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  it("should update user if found", async () => {
    const updatedUser = {
      ...mockUser,
      name: "Updated Name",
      save: jest.fn().mockResolvedValue({ 
        ...mockUser, 
        name: "Updated Name" 
      })
    };

    User.findOne.mockResolvedValue(updatedUser);

    const response = await request(app)
      .put("/api/user")
      .send({ name: "Updated Name" })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "User updated successfully",
      data: expect.objectContaining({ 
        name: "Updated Name" 
      })
    });
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .put("/api/user")
      .send({ name: "Any" })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Server error");
  });
});

describe("DELETE /api/user", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 401 if no uid in req", async () => {
    jest.doMock('../../middlewares/auth.middleware.js', () => ({
      checkRole: () => (req, res, next) => {
        next(); 
      }
    }));

    const response = await request(app).delete("/api/user");
    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized");
  });

  test("Should return 404 if user not found", async () => {
    User.findOneAndDelete = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/user")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  test("Should delete user if found", async () => {
    User.findOneAndDelete = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app)
      .delete("/api/user")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User deleted successfully");
  });

  test("Should return 500 on DB error", async () => {
    User.findOneAndDelete = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .delete("/api/user")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("DB error");
  });
});

describe('getUserRole helper function', () => {
  it('should return role for valid email', async () => {
    User.findOne = jest.fn().mockResolvedValue({ role: 'jobSeeker' });
    const role = await getUserRole('test@example.com');
    expect(role).toBe('jobSeeker');
  });

  it('should throw error when email is missing', async () => {
    await expect(getUserRole()).rejects.toThrow('Email is required');
  });

  it('should throw error when user not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    await expect(getUserRole('test@example.com')).rejects.toThrow('User not found');
  });
});

describe('fetchUserByUid helper function', () => {
  it('should return null when user not found', async () => {
    User.findOne = jest.fn().mockResolvedValue(null);
    const result = await fetchUserByUid('nonexistent-uid');
    expect(result).toBeNull();
  });

  it('should return user when found', async () => {
    User.findOne = jest.fn().mockResolvedValue(mockUser);
    const result = await fetchUserByUid('mock-firebase-uid');
    expect(result).toEqual(mockUser);
  });

  it('should handle database errors', async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
    await expect(fetchUserByUid('any-uid')).rejects.toThrow('Database error');
  });
});

describe('createBasicUser error cases', () => {
  it('should handle invalid role type', async () => {
    const response = await request(app)
      .post('/api/user/basic')
      .send({ 
        email: 'test@example.com', 
        role: 'invalidRole' 
      })
      .set('Authorization', 'Bearer mockToken');

      expect(response.body.message).toBe('Invalid role');
    expect(response.statusCode).toBe(400);
  });

  it('should handle database connection errors', async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error('Connection error'));
    
    const response = await request(app)
      .post('/api/user/basic')
      .send({ 
        email: 'test@example.com', 
        role: 'jobSeeker' 
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});

describe('Edge cases for user operations', () => {
  it('should handle malformed request data in updateUser', async () => {
    User.findOne = jest.fn().mockResolvedValue({
      ...mockUser,
      save: jest.fn().mockRejectedValue(new Error('Validation error'))
    });

    const response = await request(app)
      .put('/api/user')
      .send({ 
        invalidField: 'test' 
      })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Server error');
  });

  it('should handle concurrent update attempts', async () => {
    const mockSave = jest.fn()
      .mockRejectedValueOnce(new Error('Version error'))
      .mockResolvedValueOnce({ ...mockUser, name: 'Updated' });

    User.findOne = jest.fn().mockResolvedValue({
      ...mockUser,
      save: mockSave
    });

    const response = await request(app)
      .put('/api/user')
      .send({ name: 'Updated' })
      .set('Authorization', 'Bearer mockToken');

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe('Server error');
  });
});

describe('Helper Functions', () => {
  describe('fetchUserByUid', () => {
    it('should return user when found with UID', async () => {
      const mockUserData = { uid: 'test-uid', name: 'Test' };
      User.findOne = jest.fn().mockResolvedValue(mockUserData);

      const result = await fetchUserByUid('test-uid');
      expect(result).toEqual(mockUserData);
      expect(User.findOne).toHaveBeenCalledWith({ uid: 'test-uid' });
    });

    it('should handle database connection errors', async () => {
      User.findOne = jest.fn().mockRejectedValue(new Error('Connection failed'));
      await expect(fetchUserByUid('test-uid')).rejects.toThrow('Connection failed');
    });

    it('should return null when user not found', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      const result = await fetchUserByUid('nonexistent-uid');
      expect(result).toBeNull();
    });
  });

  describe('fetchUserById', () => {
    it('should return user with selected fields', async () => {
      const mockUserData = { 
        _id: 'user-id',
        name: 'Test',
        email: 'test@test.com',
        skills: ['JS']
      };
      User.findById = jest.fn().mockReturnValue(mockUserData);

      const result = await fetchUserById('user-id');
      expect(result).toEqual(mockUserData);
    });

    it('should throw error when user not found', async () => {
      User.findById = jest.fn().mockReturnValue(null);

      await expect(fetchUserById('nonexistent-id'))
        .rejects.toThrow('No user found with this ID');
    });

    it('should handle database errors', async () => {
      User.findById = jest.fn().mockRejectedValue(new Error('DB Error'));
      await expect(fetchUserById('user-id')).rejects.toThrow('DB Error');
    });
  });

  describe('getMissingFields', () => {
    it('should return all fields if user object is empty', () => {
      const result = getMissingFields({});
      expect(result).toEqual(['name', 'phoneNumber', 'location']);
    });

    it('should return only missing fields', () => {
      const result = getMissingFields({ name: 'Test', phoneNumber: '123' });
      expect(result).toEqual(['location']);
    });

    it('should return empty array if all fields present', () => {
      const result = getMissingFields({
        name: 'Test',
        phoneNumber: '123',
        location: 'City'
      });
      expect(result).toEqual([]);
    });

    it('should handle null/undefined values as missing', () => {
      const result = getMissingFields({
        name: null,
        phoneNumber: undefined,
        location: ''
      });
      expect(result).toEqual(['name', 'phoneNumber', 'location']);
    });
  });
  
  describe('createNewUser', () => {
    it('should create jobSeeker user successfully', async () => {
      const mockSave = jest.fn().mockResolvedValue({ role: 'jobSeeker' });
      JobSeeker.prototype.save = mockSave;

      const result = await createNewUser('test-uid', 'test@test.com', 'jobSeeker');
      expect(result.role).toBe('jobSeeker');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should create employer user successfully', async () => {
      const mockSave = jest.fn().mockResolvedValue({ role: 'employer' });
      Employer.prototype.save = mockSave;

      const result = await createNewUser('test-uid', 'test@test.com', 'employer');
      expect(result.role).toBe('employer');
      expect(mockSave).toHaveBeenCalled();
    });

    it('should throw error for invalid role', async () => {
      await expect(createNewUser('uid', 'email', 'invalid'))
        .rejects.toThrow('Invalid role');
    });

    it('should handle save errors', async () => {
      JobSeeker.prototype.save = jest.fn().mockRejectedValue(new Error('Save failed'));
      await expect(createNewUser('uid', 'email', 'jobSeeker'))
        .rejects.toThrow('Save failed');
    });
  });

  describe('validateAuth', () => {
    it('should throw error if uid is missing', () => {
      expect(() => validateAuth(null)).toThrow('Unauthorized');
      expect(() => validateAuth(undefined)).toThrow('Unauthorized');
      expect(() => validateAuth('')).toThrow('Unauthorized');
    });

    it('should not throw error if uid is present', () => {
      expect(() => validateAuth('valid-uid')).not.toThrow();
    });
  });
});

describe('Error Handling', () => {
  describe('createBasicUser edge cases', () => {
    it('should handle save errors when creating new user', async () => {
      User.findOne = jest.fn().mockResolvedValue(null);
      JobSeeker.prototype.save = jest.fn().mockRejectedValue(new Error('Save failed'));

      const response = await request(app)
        .post('/api/user/basic')
        .send({ 
          email: 'test@test.com', 
          role: 'jobSeeker' 
        })
        .set('Authorization', 'Bearer mockToken');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });

  describe('updateUser edge cases', () => {
    it('should handle validation errors during update', async () => {
      User.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        save: jest.fn().mockRejectedValue(new Error('Validation failed'))
      });

      const response = await request(app)
        .put('/api/user')
        .send({ 
          email: 'invalid-email'
        })
        .set('Authorization', 'Bearer mockToken');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Server error');
    });

    it('should handle concurrent update conflicts', async () => {
      const mockSave = jest.fn()
        .mockRejectedValueOnce(new Error('Version conflict'))
        .mockResolvedValueOnce({ ...mockUser, name: 'Updated' });

      User.findOne = jest.fn().mockResolvedValue({
        ...mockUser,
        save: mockSave
      });

      const response = await request(app)
        .put('/api/user')
        .send({ name: 'Updated' })
        .set('Authorization', 'Bearer mockToken');

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toBe('Server error');
    });
  });
});