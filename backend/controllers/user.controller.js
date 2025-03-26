import User from "../models/user/user.model.js";
import { JobSeeker } from "../models/user/jobSeeker.model.js";
import { Employer } from "../models/user/Employer.model.js";
import { createResponse } from "./helpers.js";

/**
 * Validates user authentication
 * @param {string} uid - User ID
 * @returns {void}
 * @throws {Error} If UID is missing
 */
export const validateAuth = (uid) => {
    if (!uid) throw new Error("Unauthorized");
};

/**
 * Fetches a user by UID
 * @param {string} uid - User ID
 * @returns {Promise<Object>} User document
 */
export const fetchUserByUid = async (uid) => {
    const user = await User.findOne({ uid });
    return user;
};

/**
 * Fetches a user by ID with selected fields
 * @param {string} userId - MongoDB user ID
 * @returns {Promise<Object>} User document
 */
export const fetchUserById = async (userId) => {
    try{
        const user = await User.findById(userId);
        if (!user) throw new Error("No user found with this ID");
        return user;
    } catch (err) {
        throw err;
    }
};

/**
 * Checks for missing profile fields
 * @param {Object} user - User document
 * @returns {Array<string>} Array of missing fields
 */
export const getMissingFields = (user) => {
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
export const createNewUser = async (uid, email, role) => {
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
 * Get user role helper function
 */
export const getUserRole = async (email) => {
    if (!email) throw new Error("Email is required");
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");
    return user.role;
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
            const { uid } = req;
            console.log(uid);
            if (!uid) {
                return res.status(400).json(createResponse(false, "No user provided!"));
            }

            const user = await fetchUserByUid(uid);
            if (!user) {
                return res.status(404).json(createResponse(false, "No user found with this ID"));
            }
            return res.status(200).json(createResponse(true, "User found", user));
        } catch (error) {
            if (error.message === "No user found with this ID") {
                return res.status(404).json(createResponse(false, error.message));
            }
            return res.status(500).json(createResponse(false, "Server error"));
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
            if (!email) {
                return res.status(400).json(createResponse(false, "Email is required"));
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json(createResponse(false, "User not found"));
            }

            return res.status(200).json(createResponse(true, "User found", user.role));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Server error"));
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
            if (!uid) {
                return res.status(401).json(createResponse(false, "Unauthorized"));
            }

            const user = await fetchUserByUid(uid);
            if (!user) {
                return res.status(404).json(createResponse(false, "User not found"));
            }

            const missingFields = getMissingFields(user);
            if (missingFields.length > 0) {
                return res.status(403).json({
                    success: true,
                    message: "Profile incomplete",
                    missingFields,
                    redirect: "/addDetails",
                    data: false
                });
            }

            return res.status(200).json(createResponse(true, "Profile is completed", true));

            //         message: "Profile incomplete, redirecting to addDetails",
            //         data: {
            //             status: false,
            //             redirect: "/addDetails",
            //         }
            //     });
            // }
            // return res.status(200).json({ success: true, message: "User's profile is completed!", data: { status: true } });
        } catch (error) {
            return res.status(500).json(createResponse(false, "Server error"));
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

            if (!uid) {
                return res.status(401).json(createResponse(false, "Unauthorized"));
            }

            if (!email || !role) {
                return res.status(400).json(createResponse(false, "Missing required fields"));
            }

            if(role !== "jobSeeker" && role != "employer"){
                return res.status(400).json(createResponse(false, "Invalid role"));
            }

            const existingUser = await User.findOne({ uid });
            if (existingUser) {
                return res.status(400).json(createResponse(false, "User already exists"));
            }

            await createNewUser(uid, email, role);
            return res.status(201).json(createResponse(true, "User created successfully"));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Server error"));
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
            if (!req.uid) {
                return res.status(401).json(createResponse(false, "Unauthorized"));
            }

            const user = await User.findOne({ uid: req.uid });
            if (!user) {
                return res.status(404).json(createResponse(false, "User not found"));
            }

            Object.assign(user, req.body);
            const updatedUser = await user.save();

            return res.status(200).json(createResponse(true, "User updated successfully", updatedUser));
        } catch (error) {
            return res.status(500).json(createResponse(false, "Server error"));
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
            const status = error.message === "User not found" ? 404 : 500;
            return res.status(status).json(createResponse(false, error.message));
        }
    },
};