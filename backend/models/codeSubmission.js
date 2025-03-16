import mongoose from "mongoose";
import { Schema } from "mongoose";

const codeSubmissionSchema = new mongoose.Schema({
    assessment: {
        type: Schema.Types.ObjectId,
        ref: 'CodeAssessment',
        required: true
    },

    application: {
        type: Schema.Types.ObjectId,
        ref: 'Application',
        required: true
    },

    solutionCode: { 
        type: String,
        required: true
    },

    score: Number,

    submittedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('CodeSubmission', codeSubmissionSchema);
