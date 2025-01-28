const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    // example of the user schema, can add a field for code assesments completed
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    //any other fields below could be made required
    role: {
        type: String,
        enum: ['jobSeeker', 'employer', 'admin'],
        default: 'jobSeeker'
    },

    createdAt: {
        type: Date,
        default: Date.now // 
    },

    isActive: {
        type: Boolean,
        default: true
    },

    name: {
        type: String
    },

    phoneNumber: {
        type: String
    },

    location: {
        type: String
    },

    //job seeker fields
        // array field for education and experience, as they may have multiple
    education: [ 
        {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date
        }
    ],

    experience: [
        {
        company: String,
        title: String,
        startDate: Date,
        endDate: Date,
        description: String
        }
    ],

    skills: [String],

    resume: {
        type: String // or could store file references, or a Buffer
    },

    //shows its been completed, can link this straight to a code submission instead or remove this bit?? code submission does link to a user though so can find what a user has done through that
    completedAssessments: [
        {
          type: Schema.Types.ObjectId,
          ref: 'CodeAssessment'
        }
      ],


    //employer fields - not sure if we want to split this off into a different model
    companyName: String,
    companyWebsite: String,
    companyDescription: String,
    postedJobs: [
        {
        type: Schema.Types.ObjectId,
        ref: 'Job'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);
