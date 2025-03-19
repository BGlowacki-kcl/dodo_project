import User from "../models/user/user.model.js";
import { JobSeeker } from "../models/user/jobSeeker.model.js";
import { Employer } from "../models/user/Employer.model.js"; 

export const userController = {

    async getUser(req, res) {
        try {
            if (!req || !req.uid) {
                return res.status(400).json({ success: false, message: "No user provided!" });
            }
            const { uid } = req;
            const user = await User.findOne({ uid: uid });
            
            if (!user) {
                return res.status(404).json({ success: false, message: "No user found with this ID" });
            }

            res.status(200).json({ success: true, message: "User found", data: user });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },
    async getUserById(req, res) {
        try {
            const { userId } = req.params;
            
            const user = await User.findById(userId)
                .select('name email skills education experience resume'); // Only select public fields
            
            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: "No user found with this ID" 
                });
            }

            res.status(200).json({ 
                success: true, 
                message: "User found", 
                data: user 
            });
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ 
                success: false, 
                message: "Server error" 
            });
        }
    },

    async getRole(req, res) {
        try {
            if (!req.uid) {
                return res.status(401).json({ success: false, message: "Unauthorized: No user found" });
            }
            const uid = req.uid;
            const user = await User.findOne({ uid: uid });

            if (!user) {
                return res.status(404).json({ success: false, message: "No user found with this ID" });
            }

            res.status(200).json({ success: true, message: "User found", data: user.role });
        } catch (error) {
            console.error("Error fetching user role:", error);
            res.status(500).json({ success: false, message: "Server error" });
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

            const requiredFields = ["name", "phoneNumber", "location"];
            const missingFields = requiredFields.filter(field => !user[field]);

            if (missingFields.length > 0) {
                return res.status(200).json({ 
                    success: true,
                    message: "Profile incomplete, redirecting to addDetails",
                    redirect: "/addDetails",
                    missingFields 
                });
            }

            res.status(200).json({ success: true, message: "User's profile is completed!" });
        } catch (error) {
            console.error("Error checking profile completion:", error);
            res.status(500).json({ success: false, message: "Server error" });
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

            // Prevent duplicate user creation
            const existingUser = await User.findOne({ uid });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "User already exists" });
            }

            let newUser;
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
                return res.status(404).json({ message: "User not found" });
            }

            // Properly merge nested fields (education, experience, skills)
            if (updates.education) {
                user.education = updates.education;
            }
            if (updates.experience) {
                user.experience = updates.experience;
            }
            if (updates.skills) {
                user.skills = updates.skills;
            }

            Object.assign(user, updates);
            await user.save();

            res.status(200).json({ success: true, message: "User updated successfully", data: user });
        } catch (err) {
            console.error("Error updating user:", err);
            res.status(500).json({ success: false, message: "Server error" });
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

            res.status(200).json({ success: true, message: "User deleted successfully" });
        } catch (error) {
            console.error("Error deleting user:", error);
            res.status(500).json({ success: false, message: "Server error" });
        }
    },
};
