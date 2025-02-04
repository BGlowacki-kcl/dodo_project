import mongoose from "mongoose";
import User from "./user.model";

const JobSeeker = User.discriminator(
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
            description: String
            }
        ],
        
        skills: [String],
        
        resume: {
            type: String // or could store file references, or a Buffer
        },
    })
);

module.exports = JobSeeker;