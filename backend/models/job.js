const mongoose = require('mongoose');
const { Schema } = mongoose;

const jobSchema = new Schema({

    title: {
        type: String,
        required: true
    },

    description: String,

    requirements: [String],

    location: String,

    // can change if needed if we only want 1 employment type
    employmentType: {
        type: [String],
        enum: ['full-time', 'part-time', 'internship'], // can add more employment types
        default: ['full-time']
    },

    salaryRange: {
        min: Number,
        max: Number
    },

    skillsNeeded: [String],

    experienceLevel: String, //such as entry, mid, senior

    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // can change this if we split employer into its own model
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: Date,

    applicants: [
        {
        type: Schema.Types.ObjectId,
        ref: 'User'
        }
    ],

    // here if we want jobs to have their own assesments or we can move it
    // codeAssessment: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'CodeAssessment'
    // }
});

module.exports = mongoose.model('Job', jobSchema);
