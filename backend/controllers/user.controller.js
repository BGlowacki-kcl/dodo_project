import { User } from "../models/user.model"; 
 
export const userController = {

    async getUser(req, res){
        try {
            if(!req || !req.params.uid){
                res.status(500).json({ success: false, message: "No user provided!" });
            }
            const { uid } = req.params;
            const user = User.find({ uid: uid});
            if(!user){
                res.status(500).json({ success: false, messgae: "No user found with this ID" });
            }
            res.status(200).json({ success: true, message: "User found", data: user });
        } catch (error) {
            res.status(500).json({ success: false, message:"Server error" })
        }
    },

    async getRole(req, res) {
        if(!req.uid){
            res.status(401).json({ success: false, message: "No user found" });
        }
        const user = User.find({ id: uid });
        res.status(200).json({ success: true, message: "User found", data: user.role });
    },

    async checkUserCompletion(req, res) {
        const { uid } = req;
        if (!uid) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const user = await User.findOne({ uid });
        if (!user) {
            return res.status(401).json({ success: false, message: "User not found" });
        }

        const requiredFields = ["name", "phoneNumber", "location"];
        const missingFields = requiredFields.filter(field => !user[field]);

        if (missingFields.length > 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Profile incomplete, redirecting to addDetails",
                redirect: "/addDetails",
                missingFields 
            });
        }
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
        if (role === 'jobSeeker') {
            newUser = new JobSeeker({ uid, email, role });
        } else if (role === 'employer') {
            newUser = new Employer({ uid, email, role });
        } else {
            return res.status(400).json({ message: 'Invalid role' });
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
    
            const user = await User.findByIdAndUpdate(id, updates, { new: true });
    
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json(user);
        } catch (err) {
            console.error('Error updating user:', err);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async deleteUser(req, res) {
        try {
            const { uid } = req;
    
            const user = await User.findByIdAndDelete(id);
            if (!user){
                return res.status(404).json({ message: 'User not found' });
            }

            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

}