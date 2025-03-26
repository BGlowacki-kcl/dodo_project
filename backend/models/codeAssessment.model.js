import mongoose from "mongoose";

const codeAssessmentSchema = new mongoose.Schema({
    title: String,
    description: String,
        
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    testCases: [
        {
            input: [mongoose.Schema.Types.Mixed],
            output: [mongoose.Schema.Types.Mixed]
        }
    ],
    inputForPythonJS: String,
    input: String,
    output: String,
});

export default mongoose.model('CodeAssessment', codeAssessmentSchema);
