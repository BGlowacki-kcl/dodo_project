const { Schema } = mongoose;

const codeAssessmentSchema = new Schema({
    title: String,
    description: String,
        
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    testCases: [
        {
            input: [Schema.Types.Mixed],
            output: [Schema.Types.Mixed]
        }
    ],
    funcForCpp: String,
    funcForCppTest: String
});

export default mongoose.model('CodeAssessment', codeAssessmentSchema);
