import mongoose from 'mongoose';
const { Schema } = mongoose;

/**
 * Job model schema
 * Represents a job posting with details, requirements, and associated assessments
 * Used by employers to advertise positions and collect applications
 * @type {mongoose.Schema}
 */
const jobSchema = new Schema({
    /**
     * Title of the job position
     * @type {String}
     */
    title: {
        type: String,
        required: true
    },

    /**
     * Name of the company offering the position
     * @type {String}
     */
    company: {
        type: String,
        required: true
    },

    /**
     * Geographic location of the job
     * @type {String}
     */
    location: {
        type: String,
        required: true
    },

    /**
     * Detailed description of the job responsibilities
     * @type {String}
     */
    description: {
        type: String,
        required: true
    },

    /**
     * Expected salary range for the position
     * @type {Object}
     */
    salaryRange: {
        min: Number,
        max: Number
    },

    /**
     * Type of employment (full-time, part-time, contract, etc.)
     * @type {String}
     */
    employmentType: {
        type: String,
        required: true
    },

    /**
     * List of skills or qualifications required for the position
     * @type {Array<String>}
     */
    requirements: [String],

    /**
     * Level of experience required (entry, mid, senior)
     * @type {String}
     */
    experienceLevel: String,

    /**
     * Reference to the employer who posted the job
     * Links to the Employer collection
     * @type {mongoose.Schema.Types.ObjectId}
     */
    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
        required: true
    },

    /**
     * Timestamp when the job posting was created
     * @type {Date}
     */
    createdAt: {
        type: Date,
        default: Date.now
    },

    /**
     * Application deadline date
     * @type {Date}
     */
    deadline: {
        type: Date,
        default: null
    },

    /**
     * Timestamp when the job posting was last updated
     * @type {Date}
     */
    updatedAt: Date,

    /**
     * References to assessments associated with the job
     * Links to the Assessment collection
     * @type {Array<mongoose.Schema.Types.ObjectId>}
     */
    assessments: [{
        type: Schema.Types.ObjectId,
        ref: 'Assessment'
    }],
                             
    /**
     * Screening questions to be answered during application
     * @type {Array<Object>}
     */
    questions: [
        {
            questionText: {
                type: String,
                required: true
            }
        }
    ]
});

export default mongoose.model('Job', jobSchema);
