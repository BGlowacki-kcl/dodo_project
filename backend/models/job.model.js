import mongoose from 'mongoose';
const { Schema } = mongoose;

const jobSchema = new Schema({
    // can probably add other fields we may need for the job posting, like specific phone numbers or websited for the posting (employer will have a company email/website/phone numebr linked)
    title: {
        type: String,
        required: true
    },

    company: {
        type: String,
        required: true
    },

    location: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    salaryRange: {
        min: Number,
        max: Number
    },

    employmentType: {
        type: String,
        required: true
    },

    requirements: [String],

    experienceLevel: String,

    postedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employer',
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

    assessments: [{
        type: Schema.Types.ObjectId,
        ref: 'Assessment'
    }],
                             
    questions: [
        {
            questionText: {
                type: String,
                required: false
            },
            required: {
                type: Boolean,
                default: false
            },

        }
    ]

});

export default mongoose.model('Job', jobSchema);
