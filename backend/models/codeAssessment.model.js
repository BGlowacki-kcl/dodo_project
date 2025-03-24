import mongoose from "mongoose";

/**
 * Code Assessment model schema
 * Represents programming challenges used for technical evaluations
 * Contains challenge details, test cases, and language-specific configurations
 * @type {mongoose.Schema}
 */
const codeAssessmentSchema = new mongoose.Schema({
    /**
     * Title of the code assessment
     * @type {String}
     */
    title: String,
    
    /**
     * Detailed description of the assessment problem
     * @type {String}
     */
    description: String,
    
    /**
     * Difficulty level of the assessment
     * Categorizes assessments for appropriate skill levels
     * @type {String}
     */
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    
    /**
     * Array of test cases for validating solution correctness
     * Contains input values and expected output values
     * @type {Array<Object>}
     */
    testCases: [
        {
            input: [mongoose.Schema.Types.Mixed],
            output: [mongoose.Schema.Types.Mixed]
        }
    ],
    
    /**
     * Function template for C++ solutions
     * Provides structure for candidates to implement
     * @type {String}
     */
    funcForCpp: String,
    
    /**
     * Test code for validating C++ solutions
     * @type {String}
     */
    funcForCppTest: String,
    
    /**
     * Input format specifications for Python/JavaScript solutions
     * @type {String}
     */
    inputForPythonJS: String,
    
    /**
     * Raw input string for test cases
     * @type {String}
     */
    input: String,
    
    /**
     * Expected output string for test cases
     * @type {String}
     */
    output: String,
});

export default mongoose.model('CodeAssessment', codeAssessmentSchema);
