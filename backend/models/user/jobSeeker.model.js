import mongoose from "mongoose";
import User from "./user.model.js";

const jobSeeker = User.discriminator(
    "jobSeeker",
    new mongoose.Schema({
        education: [ 
            {
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startDate: Date,
            endDate: Date
            }
        ],
        
        experience: [
            {
            company: String,
            title: String,
            startDate: Date,
            endDate: Date,
            description: String,
            }
        ],
        
        skills: [String],

        resume: {
            type: String
        },

        projects: [String],

        websites: {
            github: String,
            linkedin: String
        }
    })
);

export const JobSeeker = jobSeeker;