import request from "supertest";
import { app } from "../../app.js";
import { mockUser } from "../fixtures/user.fixture.js";
import User from "../../models/user/user.model.js";
import { JobSeeker } from "../../models/user/jobSeeker.model.js"

// Override middleware function
jest.mock('../../middlewares/auth.middleware.js', () => ({
    checkRole: () => (req, res, next) => {
        req.uid = "mock-firebase-uid"; // Attach mock user ID to request
        next();
    }
}));


describe("GET /api/user/role", () => {
    test("Should respond with 200 and return the user's role", async () => {
        
        User.findOne = jest.fn().mockResolvedValue(mockUser);

        const response = await request(app)
            .get("/api/user/role")
            .set('Authorization', 'Bearer mockToken');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("data", mockUser.role);
    });

    //// THIS TEST RETURNS 404, although im not sure if we want a 404 or not so im not changing the test yet
    test("Should return 500 if user is not found", async () => {
        // Mock User.findById to return null
        //JobSeeker.findOne.mockResolvedValueOnce(null);
        User.findOne = jest.fn().mockResolvedValueOnce(null);

        const response = await request(app)
            .get("/api/user/role")
            .set('Authorization', 'Bearer mockToken');

        expect(response.statusCode).toBe(500);
        expect(response.body).toHaveProperty("message", "No user found with this ID");
    });
});


describe("GET /api/user/role", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should respond with 200 and return the user's role", async () => {
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app)
      .get("/api/user/role")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data", mockUser.role);
  });

  test("Should return 404 if user is not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app)
      .get("/api/user/role")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "No user found with this ID");
  });

  test("Should return 401 if no req.uid is found", async () => {
    jest.doMock('../../middlewares/auth.middleware.js', () => ({
      checkRole: () => (req, res, next) => {
        next();
      }
    }));

    const response = await request(app)
      .get("/api/user/role")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Unauthorized: No user found");
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app)
      .get("/api/user/role")
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(500);
    expect(response.body.message).toBe("Server error");
  });
});

describe("GET /api/user", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("Should return 400 if no uid is provided", async () => {
    const response = await request(app).get("/api/user");
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("message", "No user provided!");
  });

  test("Should return 404 if user not found", async () => {
    User.findOne = jest.fn().mockResolvedValue(null);

    const response = await request(app).get("/api/user?uid=unknown-uid");
    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("message", "No user found with this ID");
  });

  test("Should return 200 and the user if found", async () => {
    User.findOne = jest.fn().mockResolvedValue(mockUser);

    const response = await request(app).get("/api/user?uid=mock-firebase-uid");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("data");
    expect(response.body.data.email).toBe(mockUser.email);
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/user?uid=any");
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

    const response = await request(app).get("/api/user/completed?uid=mock-uid");
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("User not found");
  });

  test("Should return 403 if missing required fields", async () => {
    const incompleteUser = { ...mockUser, name: undefined };
    User.findOne = jest.fn().mockResolvedValue(incompleteUser);

    const response = await request(app).get("/api/user/completed?uid=mock-uid");
    expect(response.statusCode).toBe(403);
    expect(response.body).toHaveProperty("missingFields", ["name"]);
  });

  test("Should return 200 if profile is completed", async () => {
    const completeUser = {
      ...mockUser,
      name: "Test",
      phoneNumber: "12345",
      location: "TestCity",
    };
    User.findOne = jest.fn().mockResolvedValue(completeUser);

    const response = await request(app).get("/api/user/completed?uid=mock-uid");
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User's profile is completed!");
  });

  test("Should return 500 on DB error", async () => {
    User.findOne = jest.fn().mockRejectedValue(new Error("DB error"));

    const response = await request(app).get("/api/user/completed?uid=something");
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

  test("Should update user if found", async () => {
    const mockSave = jest.fn().mockResolvedValue(true);
    const foundUser = { ...mockUser, save: mockSave };

    User.findOne = jest.fn().mockResolvedValue(foundUser);

    const response = await request(app)
      .put("/api/user")
      .send({ name: "Updated Name" })
      .set("Authorization", "Bearer mockToken");

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("User updated successfully");
    expect(response.body.data.name).toBe("Updated Name");
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
    expect(response.body.message).toBe("Server error");
  });
});