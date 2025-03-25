import mongoose from "mongoose";
import User from "./user.model.js";
const { Schema } = mongoose;

/**
 * Employer model extending the base User model
 * Uses mongoose discriminator pattern for user type inheritance
 * Contains employer-specific fields and relationships
 * @type {mongoose.Model}
 */
const employer = User.discriminator(
    "employer",
    new mongoose.Schema({
        /**
         * Name of the employer's company
         * @type {String}
         */
        companyName: String,
        
        /**
         * URL to the employer's company website
         * @type {String}
         */
        companyWebsite: String,
        
        /**
         * Description of the employer's company
         * @type {String}
         */
        companyDescription: String,
        
        /**
         * Array of job postings created by this employer
         * References documents in the Job collection
         * @type {Array<mongoose.Schema.Types.ObjectId>}
         */
        postedJobs: [{
                type: Schema.Types.ObjectId,
                ref: 'Job'
        }]
    })
);

export const Employer = employer;