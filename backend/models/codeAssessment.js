const mongoose = require('mongoose');
const { Schema } = mongoose;

const codeAssessmentSchema = new Schema({
    title: String,
    description: String,
    /// just an example if we wanted to do our own questions and testcases, can change if we use a third-party api.
    questions: [
        {
        prompt: String,
        difficulty: {
            type: String,
            enum: ['easy', 'medium', 'hard']
        },
        testCases: [
            {
            input: String,
            expectedOutput: String
            }
        ]
        }
    ],
    // links to multiple jobs
    relatedJobs: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Job'
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CodeAssessment', codeAssessmentSchema);
