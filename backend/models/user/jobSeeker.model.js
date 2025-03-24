import mongoose from "mongoose";
import User from "./user.model.js";
const { Schema } = mongoose;

/**
 * JobSeeker model extending the base User model
 * Uses mongoose discriminator pattern for user type inheritance
 * Contains jobSeeker-specific fields and career information
 * @type {mongoose.Model}
 */
const jobSeeker = User.discriminator(
    "jobSeeker",
    new mongoose.Schema({
        /**
         * Array of educational qualifications
         * Contains institution, degree, field of study and date information
         * @type {Array<Object>}
         */
        education: [ 
            {
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startDate: Date,
            endDate: Date
            }
        ],
        
        /**
         * Array of work experiences
         * Contains company, job title, dates, and job description
         * @type {Array<Object>}
         */
        experience: [
            {
            company: String,
            title: String,
            startDate: Date,
            endDate: Date,
            description: String
            }
        ],
        
        /**
         * List of professional skills
         * @type {Array<String>}
         */
        skills: [String],
        
        /**
         * Resume file reference
         * Stores path to resume file or could store file data directly
         * @type {String}
         */
        resume: {
            type: String // or could store file references, or a Buffer
        },
    })
);

export const JobSeeker = jobSeeker;