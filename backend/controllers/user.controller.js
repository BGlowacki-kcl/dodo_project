import User from "../models/user/user.model.js";
import { JobSeeker } from "../models/user/jobSeeker.model.js";
import { Employer } from "../models/user/Employer.model.js";

/**
 * Creates a standardized response object
 * @param {boolean} success - Indicates operation success
 * @param {string} message - Response message
 * @param {Object} [data] - Response data (optional)
 * @returns {Object} Standardized response
 */
const createResponse = (success, message, data = null) => ({
    success,
    message,
    ...(data && { data }),
});

/**
 * Validates user authentication
 * @param {string} uid - User ID
 * @returns {void}
 * @throws {Error} If UID is missing
 */
const validateAuth = (uid) => {
    if (!uid) throw new Error("Unauthorized");
};

/**
 * Fetches a user by UID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User document
 */
const fetchUserByUid = async (uid) => {
    const user = await User.findOne({ uid });
    if (!user) throw new Error("No user found with this ID");
    return user;
};

/**
 * Fetches a user by ID with selected fields
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<Object>} User document
 */
const fetchUserById = async (userId) => {
    const user = await User.findById(userId).select('name email skills education experience resume');
    if (!user) throw new Error("No user found with this ID");
    return user;
};

/**
 * Checks for missing profile fields
 * @param {Object} user - User document
 * @returns {Array<string>} Array of missing fields
 */
const getMissingFields = (user) => {
    const requiredFields = ["name", "phoneNumber", "location"];
    return requiredFields.filter(field => !user[field]);
};

/**
 * Creates a new user based on role
 * @param {string} uid - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {Promise<Object>} Created user document
 */
const createNewUser = async (uid, email, role) => {
    let newUser;
    if (role === 'jobSeeker') {
        newUser = new JobSeeker({ uid, email, role });
    } else if (role === 'employer') {
        newUser = new Employer({ uid, email, role });
    } else {
        throw new Error("Invalid role");
    }
    return newUser.save();
};

/**
 * User controller handling user-related operations
 */
export const userController = {
    /**
     * Retrieves the authenticated user's data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getUser(req, res) {
        try {
            if (!req) throw new Error("No user provided!");
            const { uid } = req;
            validateAuth(uid);

            const user = await fetchUserByUid(uid);
            return res.status(200).json(createResponse(true, "User found", user));
        } catch (error) {
            const status = error.message === "No user found with this ID" ? 404 : 400;
            return res.status(status).json(createResponse(false, error.message));
        }
    },

    /**
     * Retrieves a user's public data by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getUserById(req, res) {
        try {
            const { userId } = req.query;
            const user = await fetchUserById(userId);
            return res.status(200).json(createResponse(true, "User found", user));
        } catch (error) {
            const status = error.message === "No user found with this ID" ? 404 : 500;
            return res.status(status).json(createResponse(false, error.message));
        }
    },

    /**
     * Retrieves a user's role by email
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getRole(req, res) {
        try {
            const { email } = req.query;
            if (!email) throw new Error("Email is required");

            const user = await User.findOne({ email });
            if (!user) throw new Error("User not found");

            return res.status(200).json(createResponse(true, "User found", user.role));
        } catch (error) {
            const status = error.message === "User not found" ? 404 : 400;
            return res.status(status).json(createResponse(false, error.message));
        }
    },

    /**
     * Checks if a user's profile is complete
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async checkProfileCompletion(req, res) {
        try {
            const { uid } = req;
            validateAuth(uid);

            const user = await fetchUserByUid(uid);
            const missingFields = getMissingFields(user);

            if (missingFields.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: "Profile incomplete, redirecting to addDetails",
                    redirect: "/addDetails",
                    missingFields
                });
            }

            return res.status(200).json(createResponse(true, "User's profile is completed!"));
        } catch (error) {
            const status = error.message === "User not found" ? 404 : 401;
            return res.status(status).json(createResponse(false, error.message));
        }
    },

    /**
     * Creates a basic user with role
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async createBasicUser(req, res) {
        try {
            const { email, role } = req.body;
            const { uid } = req;
            validateAuth(uid);

            if (!email || !role) throw new Error("Missing required fields");

            const existingUser = await User.findOne({ uid });
            if (existingUser) throw new Error("User already exists");

            await createNewUser(uid, email, role);
            return res.status(201).json(createResponse(true, "User created successfully"));
        } catch (error) {
            const status = error.message === "User already exists" || error.message === "Invalid role" ? 400 : 401;
            return res.status(status).json(createResponse(false, error.message));
        }
    },

    /**
     * Updates a user's data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async updateUser(req, res) {
        try {
            const { uid } = req;
            const updates = req.body;
            validateAuth(uid);

            const user = await fetchUserByUid(uid);
            if (updates.education) user.education = updates.education;
            if (updates.experience) user.experience = updates.experience;
            if (updates.skills) user.skills = updates.skills;

            Object.assign(user, updates);
            const updatedUser = await user.save();

            return res.status(200).json(createResponse(true, "User updated successfully", updatedUser));
        } catch (error) {
            const status = error.message === "User not found" ? 404 : 401;
            return res.status(status).json(createResponse(false, error.message));
        }
    },

    /**
     * Deletes a user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async deleteUser(req, res) {
        try {
            const { uid } = req;
            validateAuth(uid);

            const user = await User.findOneAndDelete({ uid });
            if (!user) throw new Error("User not found");

            return res.status(200).json(createResponse(true, "User deleted successfully"));
        } catch (error) {
            const status = error.message === "User not found" ? 404 : 401;
            return res.status(status).json(createResponse(false, error.message));
        }
    },
};