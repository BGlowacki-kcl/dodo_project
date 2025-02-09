import { User } from "../models/user/user.model.js"; 
import { JobSeeker } from "../models/user/jobSeeker.model.js";
import { Employer } from "../models/user/Employer.model.js"; 

export const userController = {

    async getUser(req, res){
        try {
            if(!req || !req.query.uid){
                res.status(500).json({ success: false, message: "No user provided!" });
            }
            const { uid } = req.query;
            const user = await User.findOne({ uid: uid});
            if(!user){
                return res.status(500).json({ success: false, messgae: "No user found with this ID" });
            }
            res.status(200).json({ success: true, message: "User found", data: user });
        } catch (error) {
            res.status(500).json({ success: false, message:"Server error" })
        }
    },

    async getRole(req, res) {
        if(!req.uid){
            return res.status(401).json({ success: false, message: "No user found" });
        }
        const uid = req.uid;
        const user = await User.findOne({ uid: uid });
        if(!user){
            return res.status(500).json({ success: false, messgae: "No user found with this ID" });
        }
        res.status(200).json({ success: true, message: "User found", "data": user.role });
    },

    async checkProfileCompletion(req, res) {
        const { uid } = req;
        if (!uid) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        console.log("-------", uid);

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const requiredFields = ["name", "phoneNumber", "location"];
        const missingFields = requiredFields.filter(field => !user[field]);

        if (missingFields.length > 0) {
            return res.status(403).json({ 
                success: true, 
                message: "Profile incomplete, redirecting to addDetails",
                redirect: "/addDetails",
                missingFields 
            });
        }

        res.status(200).json({ success: true, message: "User's profile is completed!" });
    },

    async createBasicUser(req, res) {
        const { email, role } = req.body;
        const { uid } = req;

        if(!uid) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if(!email || !role) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }
        
        let newUser = null;
        if (role === 'jobSeeker') {
            newUser = new JobSeeker({ uid, email, role });
        } else if (role === 'employer') {
            newUser = new Employer({ uid, email, role });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        try {
            await newUser.save();
            res.status(201).json({ success: true, message: 'User created successfully' });
        } catch (err) {
            console.error('Error creating user:', err);
            res.status(500).json({ success: false, message: 'Server error' });
        }

    },

    async updateUser(req, res) {
        try {
            const { uid } = req;
            const updates = req.body;
    
            const user = await User.findOne({uid: uid});

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            Object.assign(user, updates);
            await user.save();

            res.status(200).json(user);
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async deleteUser(req, res) {
        try {
            const { uid } = req;
    
            const user = await User.findOneAndDelete({uid: uid});
            if (!user){
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    },

}