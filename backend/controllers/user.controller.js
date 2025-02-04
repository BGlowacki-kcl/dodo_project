import mongoose from "mongoose";
import { User } from "../models/user.model"; 
import { Application, findOne } from "../models/application.model";
 
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
            res.status(200).json({ success: true, message: user });
        } catch (error) {
            res.status(500).json({ success: false, message:"Server error" })
        }
    },
    async getUsersWhoApplied(req, res){
        try {
            if(!req || !req.params.jobId){
                res.status(500).json({ success: false, message: "No job provided!" });
            }
            // TODO: Check if authenticated user is authorised to see this job offer
            const jobId = req.params.jobId;
            const applications = await Application.find({ job: jobId }).populate({ applicant });
            
            if(!applications || applications.length == 0){
                res.status(500).json({ success: false, messgae: "No applications for this position" });
            }
            res.status(200).json({ success: true, data: applications });
        } catch (error) {
            res.status(500).json({ success: false, message: "Server error" })
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
        
    },
    async createUser(req, res) {
        const { uid } = req;
        if(!uid) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        const user = await findOne({ uid });

    },
    async updateUser(req, res) {

    },
    async deleteUser(req, res) {

    }

}

// async signUp(req, res){
//     try {
//         const { firebaseId, email } = req.user;
//         res.status(201).json({
//             message: "Signup successful",
//             user: { firebaseId, email }
//         });
//     } catch (error){
//         res.status(500).json({ error: error.message });
//     }
// },