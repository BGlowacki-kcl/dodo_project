import User from "../models/user/user.model.js";
import { JobSeeker } from "../models/user/jobSeeker.model.js";
import { Employer } from "../models/user/Employer.model.js";

export const userController = {
    
    async getUser(req, res) {
        try {
            if (!req || !req.query.uid) {
                return res.status(400).json({ success: false, message: "No user provided!" });
            }
            const { uid } = req.query;
            const user = await User.findOne({ uid: uid });
            if (!user) {
                return res.status(404).json({ success: false, message: "No user found with this ID" });
            }
            return res.status(200).json({ success: true, message: "User found", data: user });
        } catch (error) {
            console.error("Error fetching user:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async getRole(req, res) {
        try {
            if (!req.uid) {
                return res.status(401).json({ success: false, message: "No user found" });
            }
            const uid = req.uid;
            const user = await User.findOne({ uid: uid });
            if (!user) {
                return res.status(404).json({ success: false, message: "No user found with this ID" });
            }
            return res.status(200).json({ success: true, message: "User found", data: user.role });
        } catch (error) {
            console.error("Error fetching user role:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async checkProfileCompletion(req, res) {
        try {
            const { uid } = req;
            if (!uid) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findOne({ uid });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Required fields for profile completion
            const requiredFields = ["name", "phoneNumber", "dob", "education", "experience", "skills"];
            const missingFields = requiredFields.filter(field => !user[field] || (Array.isArray(user[field]) && user[field].length === 0));

            if (missingFields.length > 0) {
                return res.status(403).json({
                    success: true,
                    message: "Profile incomplete, redirecting to Complete Profile",
                    redirect: "/complete-profile",
                    missingFields,
                });
            }

            return res.status(200).json({ success: true, message: "User's profile is complete!" });
        } catch (error) {
            console.error("Error checking profile completion:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async createBasicUser(req, res) {
        try {
            const { email, role } = req.body;
            const { uid } = req;

            if (!uid) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            if (!email || !role) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            let newUser = null;
            if (role === 'jobSeeker') {
                newUser = new JobSeeker({ uid, email, role });
            } else if (role === 'employer') {
                newUser = new Employer({ uid, email, role });
            } else {
                return res.status(400).json({ success: false, message: "Invalid role" });
            }

            await newUser.save();
            return res.status(201).json({ success: true, message: "User created successfully" });
        } catch (err) {
            console.error("Error creating user:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async updateUser(req, res) {
        try {
            const { uid } = req;
            const updates = req.body;

            if (!uid) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findOne({ uid: uid });

            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            // Ensure that education, experience, and skills are stored as arrays
            if (updates.education && !Array.isArray(updates.education)) {
                updates.education = [updates.education];
            }
            if (updates.experience && !Array.isArray(updates.experience)) {
                updates.experience = [updates.experience];
            }
            if (updates.skills && !Array.isArray(updates.skills)) {
                updates.skills = [updates.skills];
            }

            // Update user object with new values
            Object.assign(user, updates);
            await user.save();

            return res.status(200).json({ success: true, message: "User updated successfully", data: user });
        } catch (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },

    async deleteUser(req, res) {
        try {
            const { uid } = req;

            if (!uid) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            const user = await User.findOneAndDelete({ uid: uid });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }

            return res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            return res.status(500).json({ success: false, message: "Server error" });
        }
    },
};
