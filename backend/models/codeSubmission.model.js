import mongoose from "mongoose";
import { Schema } from "mongoose";

/**
 * Code Submission model schema
 * Represents a solution submitted by an applicant for a code assessment
 * Tracks assessment results, code submitted, and performance metrics
 * @type {mongoose.Schema}
 */
const codeSubmissionSchema = new mongoose.Schema({
    /**
     * Reference to the associated code assessment challenge
     * Links to the CodeAssessment collection
     * @type {mongoose.Schema.Types.ObjectId}
     */
    assessment: {
        type: Schema.Types.ObjectId,
        ref: 'CodeAssessment',
        required: true
    },

    /**
     * Reference to the job application this submission belongs to
     * Links to the Application collection
     * @type {mongoose.Schema.Types.ObjectId}
     */
    application: {
        type: Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },

    /**
     * The actual code solution submitted by the applicant
     * @type {String}
     */
    solutionCode: { 
        type: String,
        required: true
    },

    /**
     * Numerical evaluation score of the submission
     * @type {Number}
     */
    score: Number,

    /**
     * Programming language used for the solution
     * @type {String}
     */
    language: {
        type: String,
        required: true,
        enum: ['python', 'cpp', 'javascript']
    },

    /**
     * Timestamp when submission was created
     * Automatically set to current date if not provided
     * @type {Date}
     */
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('CodeSubmission', codeSubmissionSchema);
