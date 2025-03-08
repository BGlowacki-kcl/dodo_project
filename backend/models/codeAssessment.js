const mongoose = require('mongoose');
const { Schema } = mongoose;

const codeAssessmentSchema = new Schema({
    title: String,
    description: String,
        
    prompt: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    testCases: [
        {
            input: String,
            output: String
        }
    ]
});

module.exports = mongoose.model('CodeAssessment', codeAssessmentSchema);
