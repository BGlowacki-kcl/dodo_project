const mongoose = require('mongoose');
const { Schema } = mongoose;

const codeSubmissionSchema = new Schema({
    // if we use a third party we can link to a third party submission or something like that
    assessment: {
        type: Schema.Types.ObjectId,
        ref: 'CodeAssessment',
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    job: {
        type: Schema.Types.ObjectId,
        ref: 'Job'
    },

    // if its unnecessary and too much space, we dont have to store the solution code
    solutionCode: { 
        type: String,
        required: true
    },

    score: Number, // if we want a score, otherwise can remove

    status: {
        type: String,
        enum: ['passed', 'failed', 'in_review'],
        default: 'in_review'
    },

    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CodeSubmission', codeSubmissionSchema);
